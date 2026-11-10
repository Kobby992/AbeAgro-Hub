# Derived product fields: for the owner to confirm

These values were not in the catalogue document. They were worked out by reading each product's description and specs, and they power the catalogue filters, card names and "What you might also need". Everything else about the products comes straight from the catalogue and has not been changed.

To change a value, edit `content/products.json` or tell Claude Code what to correct.

## Please check these first

- **Commercial Fufu Machine:** The catalogue says "1.5–3 kW" and "high-torque motor", so it is listed as electric, but the photo appears to show a petrol-type engine. Please confirm the power source.
- **Grain Grinding Mill (Pulverizer with Cyclone):** Catalogue says "8–15 hp engine" without a fuel. Assumed diesel at that size.
- **SOLO PORT 423 Motorized Mist Blower:** Photo shows only the boxed packaging, so imageNeedsReplacement is set. Please supply a better photo.
- **Centrifugal Pump:** Catalogue says it can run from a tractor via belt. Listed under tractor-pto as the closest option.
- **Groundnut Sheller:** Catalogue says "8–15 hp engine" without a fuel. Assumed diesel at that size.
- **Electric Maize Thresher:** Catalogue says "6.5 hp engine" without a fuel. Assumed petrol at that size.
- **SB10 Rice Huller / Mill:** The spec lists the SB30 sieve as related, but the catalogue says it fits the SB-30 and to confirm dimensions for other models. Please confirm whether to keep it here.
- **SB30 Rice Huller Sieve:** A spare part with no power source, so it appears only when no power filter is chosen.
- **PVC Lay-Flat Irrigation Hose:** A hose with no power source, so it appears only when no power filter is chosen.
- **Electric Car Washing Machine:** Renamed from Car Washing Machine in November 2026 and listed as electric only.

## What the columns mean

- **Short name:** shown on product cards.
- **Power:** petrol, diesel, electric, manual or tractor-pto.
- **Scale:** household, small-business or commercial. This is a judgement based on capacity and typical uses.
- **Crops:** used by the crop filter. "none" means the machine is not tied to a crop, so it appears only when no crop filter is chosen.
- **Featured:** shown on the home page, as listed in the build spec.
- **Related:** shown under "What you might also need".

## All 39 products

| Product                                       | Short name              | Power                         | Scale          | Crops                                          | Featured | Related                                                                       |
| --------------------------------------------- | ----------------------- | ----------------------------- | -------------- | ---------------------------------------------- | -------- | ----------------------------------------------------------------------------- |
| ZTL-543 Brush Cutter                          | ZTL-543 Brush Cutter    | petrol                        | small-business | none                                           |          | Precision Seed Planter, SOLO 423 Mist Blower, 3-inch Petrol Pump              |
| Multi-Purpose Chaff Cutter                    | Chaff Cutter            | electric                      | small-business | maize, livestock-feed                          |          | Hammer Mill, Feed Pelletizer, Electric Motors                                 |
| Model 900 Multi-Functional Thresher           | Model 900 Thresher      | diesel, electric              | commercial     | maize, rice, sorghum, millet, soybean, beans   |          | Diesel Engine, Electric Maize Thresher, JLX Rice Destoner                     |
| Grain Grinding Mill (Pulverizer with Cyclone) | Grain Grinding Mill     | electric, diesel              | small-business | maize, millet, sorghum, livestock-feed, pepper |          | Diesel Engine, Electric Motors, Corn Mill, Hammer Mill                        |
| SOLO PORT 423 Motorized Mist Blower           | SOLO 423 Mist Blower    | petrol                        | small-business | cocoa, vegetables                              | Yes      | ZTL-543 Brush Cutter, Precision Seed Planter, 3-inch Petrol Pump              |
| JLX Rice Destoner                             | JLX Rice Destoner       | electric                      | commercial     | rice, beans                                    |          | SB10 Rice Mill, SB30 Rice Mill, Satake Bucket Elevator, CHP150 Rice Mill      |
| Centrifugal Pump                              | Centrifugal Pump        | diesel, electric, tractor-pto | commercial     | vegetables                                     |          | PVC Lay-Flat Hose, Diesel Engine, Electric Motors                             |
| Wet & Dry Mini Grinding Mill                  | Wet & Dry Mini Mill     | petrol                        | small-business | maize, millet, beans, groundnut, pepper        |          | Corn Mill, Pepper Mill, Petrol Engine, PLUS.HONDAY GX200 Engine               |
| CHP150 Rice Milling Machine                   | CHP150 Rice Mill        | electric                      | commercial     | rice                                           |          | SB30 Rice Mill, JLX Rice Destoner, Satake Bucket Elevator, Electric Motors    |
| Electric Feed Pelletizing Machine             | Feed Pelletizer         | electric                      | small-business | livestock-feed                                 |          | Hammer Mill, Chaff Cutter, Electric Motors                                    |
| Electric Maize Thresher                       | Electric Maize Thresher | electric, petrol              | small-business | maize                                          |          | Corn Mill, Hammer Mill, Model 900 Thresher                                    |
| Precision Seed Planter                        | Precision Seed Planter  | manual                        | household      | maize, groundnut, beans, soybean, sorghum      |          | ZTL-543 Brush Cutter, Electric Maize Thresher, Groundnut Sheller              |
| Hammer Mill                                   | Hammer Mill             | electric                      | commercial     | maize, soybean, livestock-feed                 | Yes      | Feed Pelletizer, Chaff Cutter, Electric Motors, Diesel Engine                 |
| SB10 Rice Huller / Mill                       | SB10 Rice Mill          | electric, diesel              | commercial     | rice                                           | Yes      | JLX Rice Destoner, Satake Bucket Elevator, Diesel Engine, SB30 Huller Sieve   |
| SB10D Rice Mill                               | SB10D Rice Mill         | diesel                        | commercial     | rice                                           |          | JLX Rice Destoner, Satake Bucket Elevator, Diesel Engine, CHP150 Rice Mill    |
| SB30 Rice Huller / Mill                       | SB30 Rice Mill          | electric, diesel              | commercial     | rice                                           |          | JLX Rice Destoner, Satake Bucket Elevator, SB30 Huller Sieve, Diesel Engine   |
| SB30 Rice Huller Sieve                        | SB30 Huller Sieve       | none                          | commercial     | rice                                           |          | SB30 Rice Mill, SB10 Rice Mill, CHP150 Rice Mill                              |
| Satake Bucket Elevator                        | Satake Bucket Elevator  | electric                      | commercial     | rice                                           |          | SB30 Rice Mill, JLX Rice Destoner, SB10 Rice Mill, CHP150 Rice Mill           |
| 3-inch Petrol Water Pump (PM&T WP30)          | 3-inch Petrol Pump      | petrol                        | small-business | vegetables                                     | Yes      | PVC Lay-Flat Hose, Petrol Engine, PLUS.HONDAY GX200 Engine                    |
| 4-inch Diesel Water Pump                      | 4-inch Diesel Pump      | diesel                        | commercial     | vegetables, rice                               |          | PVC Lay-Flat Hose, Diesel Engine, Centrifugal Pump                            |
| Electric Water Pump                           | Electric Water Pump     | electric                      | household      | vegetables                                     |          | PVC Lay-Flat Hose, Electric Motors, 3-inch Petrol Pump                        |
| PVC Lay-Flat Irrigation Hose                  | PVC Lay-Flat Hose       | none                          | small-business | vegetables, rice                               |          | 3-inch Petrol Pump, 4-inch Diesel Pump, Belt-Driven Water Pump, Pressure Pump |
| Diesel Engine for Agricultural Machinery      | Diesel Engine           | diesel                        | small-business | none                                           |          | Corn Mill, SB10D Rice Mill, Belt-Driven Water Pump, 4-inch Diesel Pump        |
| Electric Motors for Agricultural Machinery    | Electric Motors         | electric                      | small-business | none                                           |          | Corn Mill, SB10 Rice Mill, Hammer Mill, Feed Pelletizer                       |
| Car Washing Machine                           | Car Washing Machine     | electric, petrol              | small-business | none                                           |          | Petrol Engine, Electric Motors, PVC Lay-Flat Hose                             |

## Added or changed in November 2026

From the owner's _Website Changes and Updates_ document. The nine new machines had no catalogue sheet, so their descriptions and specs come from the owner's photos and typical figures for machines of the same type found online. All are marked for confirmation.

| Product                   | Power source             | Scale          | Crops                        | Note                                                   |
| ------------------------- | ------------------------ | -------------- | ---------------------------- | ------------------------------------------------------ |
| Disk Mill (was Corn Mill) | electric, diesel         | small-business | maize, millet, sorghum, rice | Power set to 11–22.5 kW by the owner                   |
| Irrigation Water Pump     | diesel                   | small-business | vegetables, rice             | Port size estimated from the photo                     |
| Rice Huller               | electric, diesel         | small-business | rice                         | Capacity and power are typical ranges                  |
| Concrete Vibrator         | petrol                   | small-business | none                         | New Construction Equipment category                    |
| Plate Compactor           | petrol                   | small-business | none                         | New Construction Equipment category                    |
| High Pressure Pump        | electric, diesel, petrol | small-business | none                         | Drives from a motor or an engine                       |
| Ex Motor for Gas          | electric                 | commercial     | none                         | Confirm the Ex marking and kW rating                   |
| Diesel Car Wash Machine   | diesel                   | small-business | none                         | Engine size estimated from the photo                   |
| Kirloskar Diesel Engine   | diesel                   | small-business | none                         | Confirm the hp of the model you stock                  |
| Corn Mill (Blue)          | electric, diesel         | small-business | maize, millet, sorghum       | Added 10 Nov 2026; specs are typical ranges            |
| Corn Mill (Green)         | electric, diesel         | small-business | maize, millet, sorghum       | Added 10 Nov 2026; same photo as the earlier Corn Mill |

Removed: Groundnut Huller, Disc Mill, Cassava Grater, and later Corn Mill (plate type), Pepper Mill and 4x4 Water Pump with Diesel Engine, then Kirloskar Water Pump (10 Nov 2026).
