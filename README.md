![](https://img.shields.io/badge/Foundry-v12-informational)
<!--- Downloads @ Latest Badge -->
<!--- replace <user>/<repo> with your username/repository -->
<!--- ![Latest Release Download Count](https://img.shields.io/github/downloads/<user>/<repo>/latest/module.zip) -->

<!--- Forge Bazaar Install % Badge -->
<!--- replace <your-module-name> with the `name` in your manifest -->
<!--- ![Forge Installs](https://img.shields.io/badge/dynamic/json?label=Forge%20Installs&query=package.installs&suffix=%25&url=https%3A%2F%2Fforge-vtt.com%2Fapi%2Fbazaar%2Fpackage%2F<your-module-name>&colorB=4aa94a) -->

# ProjectFU Playtest Support

This module aims to add support for classes and features that were present in playtest documents to the [ProjectFU](https://github.com/League-of-Fabulous-Developers/FoundryVTT-Fabula-Ultima) system for FoundryVTT.
As a secondary goal, it is also intended as a showcase for how developers can integrate with the core ProjectFU system.

Our plan is to promote classes and features into the core system, once the books they appear in are available internationally.

## Installation
Use automatic Foundry module installation.\
Module Manifest:\
`https://github.com/League-of-Fabulous-Developers/ProjectFU-Playtest/releases/latest/download/module.json`

## Currently supported:

### Arcana Rework
* Arcanum Class Feature

### Camp Activities
* Camp Activity Optional Feature

## Successfully Migrated to System:

### Esper
* Psychic Gift class feature

### Mutant
* Therioform class feature
* Associated Therioforms section for the NPC sheet

### Pilot
* Vehicle class feature
* Armor, Weapon and Support Modules
* Vehicle section for the Character sheet

### Floralist
* Magiseed class feature
* Garden section for the Character sheet
* Growth clock integration

### Gourmet
* Ingredient and Cookbook class features
* Cooking tool
* "All You Can Eat" support
  * use an ActiveEffect to set `flags.projectfu-playtest.AllYouCanEat` to true

### Invoker
* Invocations class feature
* Wellspring manager
* "Inner Wellspring" support
  * use an ActiveEffect to set `flags.projectfu-playtest.InnerWellspring` to the desired element: `air`,`earth`,`fire`,`lightning` or `water`