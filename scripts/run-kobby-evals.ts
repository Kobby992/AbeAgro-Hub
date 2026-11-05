/**
 * Runs tests/kobby/evals.yaml against the real model and prints a pass/fail table (BUILD_SPEC §7.8).
 * Passes at 90% or better with every critical case passing. Costs real API money per run.
 *
 *   npm run kobby:evals                 all cases
 *   npm run kobby:evals -- price stock  only cases whose id contains one of these words
 *
 * Exit codes: 0 passed, 1 failed, 2 not run (no API key).
 */
import { streamText, type ModelMessage } from "ai";
import { kobbyModel, kobbySettings } from "../src/kobby/agent";
import { grade, loadEvals, type EvalCase, type Transcript } from "../tests/kobby/grade";

const PASS_MARK = 0.9;
const CONCURRENCY = 3;

// Haiku 5.5 per million tokens. Only used to print an estimate.
const PRICES = { input: 0.1, output: 0.5 };

try {
  process.loadEnvFile(".env.local");
} catch {
  // The key can also come from the environment.
}

// Quote flows must not reach the real database or the sales mailbox.
process.env.QUOTE_TEST_SINK = ".e2e/kobby-evals-sink.jsonl";

const tokens = { input: 0, output: 0, cached: 0 };

async function play(evalCase: EvalCase): Promise<Transcript> {
  const model = await kobbyModel();
  if (!model) throw new Error("No model");

  const transcript: Transcript = { replies: [], tools: [] };
  const messages: ModelMessage[] = [];
  let customerText = "";

  for (const turn of evalCase.turns) {
    customerText += ` ${turn}`;
    messages.push({ role: "user", content: turn });
    // Streams like the API route does, so evals take the same path as customers.
    const result = streamText({
      model,
      ...kobbySettings("", { customerText }),
      messages,
      onError: ({ error }) => {
        throw error;
      },
    });
    const usage = await result.usage;
    messages.push(...(await result.response).messages);
    transcript.replies.push(await result.text);
    for (const step of await result.steps) {
      for (const output of step.toolResults) {
        transcript.tools.push({
          name: output.toolName,
          input: output.input,
          output: output.output,
        });
      }
    }
    tokens.input += usage.inputTokens ?? 0;
    tokens.output += usage.outputTokens ?? 0;
    tokens.cached += usage.inputTokenDetails?.cacheReadTokens ?? 0;
  }
  return transcript;
}

type Result = { evalCase: EvalCase; problems: string[]; lastReply: string };

async function run(evalCase: EvalCase): Promise<Result> {
  try {
    const transcript = await play(evalCase);
    return {
      evalCase,
      problems: grade(evalCase, transcript),
      lastReply: transcript.replies.at(-1) ?? "",
    };
  } catch (error) {
    return { evalCase, problems: [`Error: ${(error as Error).message}`], lastReply: "" };
  }
}

async function runAll(cases: EvalCase[]): Promise<Result[]> {
  const results: Result[] = [];
  const queue = [...cases];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let next = queue.shift(); next; next = queue.shift()) results.push(await run(next));
    }),
  );
  return results.sort((a, b) => cases.indexOf(a.evalCase) - cases.indexOf(b.evalCase));
}

function report(results: Result[]): boolean {
  const width = Math.max(...results.map((result) => result.evalCase.id.length));
  console.log(`${"Case".padEnd(width)}  Result`);
  for (const { evalCase, problems } of results) {
    const mark = problems.length ? "FAIL" : "pass";
    console.log(`${evalCase.id.padEnd(width)}  ${mark}${evalCase.critical ? "  (critical)" : ""}`);
  }

  const failed = results.filter((result) => result.problems.length > 0);
  for (const { evalCase, problems, lastReply } of failed) {
    console.log(`\n${evalCase.id}`);
    for (const problem of problems) console.log(`  - ${problem}`);
    console.log(`  Last reply: ${lastReply.replace(/\s+/g, " ").slice(0, 300)}`);
  }

  const score = (results.length - failed.length) / results.length;
  const criticalFailed = failed.filter((result) => result.evalCase.critical).length;
  const cost =
    ((tokens.input - tokens.cached + tokens.cached * 0.1) * PRICES.input +
      tokens.output * PRICES.output) /
    1_000_000;

  console.log(
    `\nPassed ${results.length - failed.length} of ${results.length} (${Math.round(score * 100)}%). ` +
      `Critical failures: ${criticalFailed}.`,
  );
  console.log(
    `Tokens: ${tokens.input} in (${tokens.cached} from cache), ${tokens.output} out. ` +
      `Estimated cost at Haiku 5.5 prices: $${cost.toFixed(3)}.`,
  );
  return score >= PASS_MARK && criticalFailed === 0;
}

async function main() {
  if (process.env.KOBBY_TEST_MODEL) {
    console.warn("SCRIPTED MODEL: this checks the eval runner only, not Kobby's answers.");
  } else if (!process.env.ANTHROPIC_API_KEY) {
    console.error("NOT RUN: ANTHROPIC_API_KEY is not set. No evals were run.");
    process.exit(2);
  }
  const filters = process.argv.slice(2);
  const cases = loadEvals().filter(
    ({ id }) => filters.length === 0 || filters.some((filter) => id.includes(filter)),
  );
  const passed = report(await runAll(cases));
  process.exit(passed ? 0 : 1);
}

void main();
