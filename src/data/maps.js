// Schémas des régions dessinés pour le site (pas les cartes officielles du jeu).
// Chaque lieu : [nom anglais de base, x, y, genre]. Genres : c = ville (Centre Pokémon), r = route,
// w = route maritime, d = grotte, forêt ou bâtiment.
// Liaisons : "A > B" chemin terrestre ou maritime, "A ~ B" ferry.
// Les noms correspondent aux lieux des données PokeMMO, sans la précision entre parenthèses (jour, saison, étage…).

// Villes sans rencontres sauvages : ajoutées pour relier les routes, avec leur nom français
export const EXTRA_FR = {
  "Pewter City": "Argenta", "Saffron City": "Safrania", "Lavender Town": "Lavanville", "Indigo Plateau": "Plateau Indigo",
  "Goldenrod City": "Doublonville", "Littleroot Town": "Bourg-en-Vol", "Oldale Town": "Rosyères", "Rustboro City": "Mérouville",
  "Verdanturf Town": "Vergazon", "Fallarbor Town": "Autéquia", "Lavaridge Town": "Vermilava", "Mauville City": "Lavandia",
  "Fortree City": "Cimetronelle", "Sandgem Town": "Littorella", "Jubilife City": "Féli-Cité", "Floraville": "Floraville",
  "Floaroma Town": "Floraville", "Oreburgh City": "Charbourg", "Hearthome City": "Unionpolis", "Solaceon Town": "Bonville",
  "Veilstone City": "Voilaroc", "Snowpoint City": "Frimapic", "Fight Area": "Aire de Combat", "Nuvema Town": "Renouet",
  "Accumula Town": "Arabelle", "Nacrene City": "Maillard", "Castelia City": "Volucité", "Nimbasa City": "Méanville",
  "Mistralton City": "Parsemille", "Opelucid City": "Janusia", "Lacunosa Town": "Ondes-sur-Mer", "Skyarrow Bridge": "Pont Sagiciel",
  "Pokémon League": "Ligue Pokémon", "Black City": "Ville Noire", "Two Island": "Île Deux", "Six Island": "Île Six", "Seven Island": "Île Sept",
};

const KANTO = {
  nodes: `
    Pallet Town|22|64|c, Route 1|22|54|r, Viridian City|22|44|c, Route 22|12|44|r, Route 23|4|32|r, Victory Road|4|22|d, Indigo Plateau|4|12|c,
    Route 2|22|34|r, Viridian Forest|22|27|d, Pewter City|22|18|c, Route 3|33|18|r, Mt. Moon|43|14|d, Route 4|53|14|r, Cerulean City|62|14|c,
    Cerulean Cave|55|7|d, Route 24|62|6|r, Route 25|72|3|r, Route 9|72|14|r, Route 10|82|16|r, Power Plant|90|10|d, Rock Tunnel|82|24|d,
    Lavender Town|82|33|c, Pokémon Tower|90|33|d, Route 5|62|23|r, Saffron City|62|33|c, Route 6|62|43|r, Vermilion City|62|52|c, S.s. Anne|56|60|d,
    Route 11|72|52|r, Diglett's Cave|78|58|d, Route 7|52|33|r, Celadon City|42|33|c, Route 8|72|33|r, Route 12|84|44|r, Route 13|80|56|r,
    Route 14|72|64|r, Route 15|60|70|r, Fuchsia City|48|70|c, Safari Zone|48|62|d, Route 16|32|33|r, Route 17|32|50|r, Route 18|38|70|r,
    Route 19|48|80|w, Route 20|38|86|w, Seafoam Islands|30|86|d, Cinnabar Island|22|86|c, Pokémon Mansion|15|90|d, Route 21|22|75|w,
    One Island|110|16|c, Kindle Road|110|7|r, Mt. Ember|110|-1|d, Treasure Beach|102|22|r, Two Island|122|12|c, Cape Brink|122|4|r,
    Three Isle Port|134|20|c, Bond Bridge|128|27|r, Berry Forest|142|14|d, Four Island|110|34|c, Icefall Cave|102|34|d,
    Five Island|128|40|c, Five Isle Meadow|136|40|r, Memorial Pillar|142|47|r, Water Labyrinth|128|32|w, Resort Gorgeous|121|47|r, Lost Cave|114|50|d,
    Six Island|146|58|c, Water Path|146|66|r, Ruin Valley|140|72|r, Green Path|154|58|r, Outcast Island|156|50|r, Pattern Bush|156|66|d, Altering Cave|146|78|d,
    Seven Island|122|60|c, Trainer Tower|114|60|d, Canyon Entrance|122|68|r, Sevault Canyon|122|76|r, Tanoby Ruins|122|84|r,
    Monean Chamber|108|90|d, Liptoo Chamber|114|92|d, Weepth Chamber|120|94|d, Dilford Chamber|126|94|d, Scufib Chamber|132|92|d, Rixy Chamber|138|90|d, Viapois Chamber|142|86|d`,
  edges: `
    Pallet Town>Route 1, Route 1>Viridian City, Viridian City>Route 22, Route 22>Route 23, Route 23>Victory Road, Victory Road>Indigo Plateau,
    Viridian City>Route 2, Route 2>Viridian Forest, Viridian Forest>Pewter City, Pewter City>Route 3, Route 3>Mt. Moon, Mt. Moon>Route 4, Route 4>Cerulean City,
    Cerulean City>Route 24, Route 24>Route 25, Cerulean City>Cerulean Cave, Cerulean City>Route 9, Route 9>Route 10, Route 10>Power Plant, Route 10>Rock Tunnel,
    Rock Tunnel>Lavender Town, Lavender Town>Pokémon Tower, Cerulean City>Route 5, Route 5>Saffron City, Saffron City>Route 6, Route 6>Vermilion City,
    Vermilion City>S.s. Anne, Vermilion City>Route 11, Route 11>Diglett's Cave, Saffron City>Route 7, Route 7>Celadon City,
    Saffron City>Route 8, Route 8>Lavender Town, Lavender Town>Route 12, Route 12>Route 11, Route 12>Route 13, Route 13>Route 14, Route 14>Route 15,
    Route 15>Fuchsia City, Fuchsia City>Safari Zone, Celadon City>Route 16, Route 16>Route 17, Route 17>Route 18, Route 18>Fuchsia City,
    Fuchsia City>Route 19, Route 19>Route 20, Route 20>Seafoam Islands, Seafoam Islands>Cinnabar Island, Cinnabar Island>Pokémon Mansion,
    Cinnabar Island>Route 21, Route 21>Pallet Town,
    Vermilion City~One Island, One Island>Kindle Road, Kindle Road>Mt. Ember, One Island>Treasure Beach, One Island~Two Island, Two Island>Cape Brink,
    One Island~Three Isle Port, Three Isle Port>Bond Bridge, Bond Bridge>Berry Forest, One Island~Four Island, Four Island>Icefall Cave,
    One Island~Five Island, Five Island>Five Isle Meadow, Five Isle Meadow>Memorial Pillar, Five Island>Water Labyrinth, Five Island>Resort Gorgeous, Resort Gorgeous>Lost Cave,
    One Island~Six Island, Six Island>Water Path, Water Path>Ruin Valley, Six Island>Green Path, Green Path>Outcast Island, Green Path>Pattern Bush, Water Path>Altering Cave,
    One Island~Seven Island, Seven Island>Trainer Tower, Seven Island>Canyon Entrance, Canyon Entrance>Sevault Canyon, Sevault Canyon>Tanoby Ruins,
    Tanoby Ruins>Monean Chamber, Tanoby Ruins>Liptoo Chamber, Tanoby Ruins>Weepth Chamber, Tanoby Ruins>Dilford Chamber, Tanoby Ruins>Scufib Chamber, Tanoby Ruins>Rixy Chamber, Tanoby Ruins>Viapois Chamber`,
};

const JOHTO = {
  nodes: `
    New Bark Town|88|54|c, Route 29|78|54|r, Cherrygrove City|68|54|c, Route 30|68|44|r, Route 31|64|34|r, Violet City|54|34|c, Sprout Tower|54|27|d,
    Route 32|54|46|r, Ruins Of Alph|46|42|d, Union Cave|54|58|d, Route 33|48|65|r, Azalea Town|40|65|c, Slowpoke Well|40|72|d, Ilex Forest|30|65|d,
    Route 34|30|55|r, Goldenrod City|30|45|c, Route 35|30|37|r, National Park|30|30|d, Pokéathlon Dome|22|34|d, Route 36|42|28|r, Route 37|42|20|r,
    Ecruteak City|42|12|c, Burned Tower|35|7|d, Bell Tower|48|5|d, Route 38|32|14|r, Route 39|22|16|r, Olivine City|14|22|c, Route 40|8|30|w, Route 41|8|42|w,
    Whirl Islands|16|46|d, Cianwood City|4|52|c, Cliff Edge Gate|4|60|d, Route 47|6|68|r, Cliff Cave|12|72|d, Route 48|18|76|r, Safari Zone Gate|24|79|d, Safari Zone|30|82|d,
    Route 42|52|12|r, Mt. Mortar|52|19|d, Mahogany Town|62|12|c, Team Rocket Hq|68|16|d, Route 43|62|4|r, Lake Of Rage|62|-4|r,
    Route 44|72|12|r, Ice Path|80|12|d, Blackthorn City|88|12|c, Dragon's Den|94|6|d, Route 45|88|26|r, Dark Cave|76|32|d, Route 46|80|44|r,
    Route 27|98|54|r, Tohjo Falls|106|54|d, Route 26|108|42|r, Victory Road|108|30|d, Indigo Plateau|108|20|c, Route 28|116|16|r, Mt. Silver|124|12|d, Mt. Silver Cave|128|4|d`,
  edges: `
    New Bark Town>Route 29, Route 29>Cherrygrove City, Cherrygrove City>Route 30, Route 30>Route 31, Route 31>Violet City, Violet City>Sprout Tower,
    Violet City>Route 32, Route 32>Ruins Of Alph, Route 32>Union Cave, Union Cave>Route 33, Route 33>Azalea Town, Azalea Town>Slowpoke Well, Azalea Town>Ilex Forest,
    Ilex Forest>Route 34, Route 34>Goldenrod City, Goldenrod City>Route 35, Route 35>National Park, National Park>Pokéathlon Dome, National Park>Route 36, Route 36>Violet City,
    Route 36>Route 37, Route 37>Ecruteak City, Ecruteak City>Burned Tower, Ecruteak City>Bell Tower, Ecruteak City>Route 38, Route 38>Route 39, Route 39>Olivine City,
    Olivine City>Route 40, Route 40>Route 41, Route 41>Whirl Islands, Route 41>Cianwood City, Cianwood City>Cliff Edge Gate, Cliff Edge Gate>Route 47, Route 47>Cliff Cave,
    Route 47>Route 48, Route 48>Safari Zone Gate, Safari Zone Gate>Safari Zone, Ecruteak City>Route 42, Route 42>Mt. Mortar, Route 42>Mahogany Town,
    Mahogany Town>Team Rocket Hq, Mahogany Town>Route 43, Route 43>Lake Of Rage, Mahogany Town>Route 44, Route 44>Ice Path, Ice Path>Blackthorn City,
    Blackthorn City>Dragon's Den, Blackthorn City>Route 45, Route 45>Dark Cave, Dark Cave>Route 31, Route 45>Route 46, Route 46>Route 29,
    New Bark Town>Route 27, Route 27>Tohjo Falls, Tohjo Falls>Route 26, Route 26>Victory Road, Victory Road>Indigo Plateau, Indigo Plateau>Route 28, Route 28>Mt. Silver, Mt. Silver>Mt. Silver Cave`,
};

const HOENN = {
  nodes: `
    Littleroot Town|30|62|c, Route 101|30|54|r, Oldale Town|30|46|c, Route 103|30|38|r, Altering Cave|22|34|d, Route 102|22|46|r, Petalburg City|14|46|c,
    Route 104|6|42|r, Petalburg Woods|6|33|d, Rustboro City|6|22|c, Route 115|6|12|r, Meteor Falls|13|6|d, Route 116|14|22|r, Rusturf Tunnel|22|22|d,
    Verdanturf Town|30|24|c, Route 114|21|0|r, Fallarbor Town|29|-4|c, Route 113|37|-4|r, Route 111|46|8|r, Desert Underpass|52|0|d, Mirage Tower|54|7|d,
    Route 112|38|12|r, Jagged Pass|30|8|r, Magma Hideout|30|1|d, Lavaridge Town|23|12|c, Fiery Path|40|18|d, Mauville City|46|26|c, Route 117|38|26|r,
    Route 110|46|36|r, New Mauville|54|38|d, Slateport City|46|46|c, Route 118|56|26|r, Route 119|60|16|r, Fortree City|60|5|c, Route 120|70|5|r,
    Scorched Slab|72|12|d, Route 121|80|7|r, Safari Zone|80|0|d, Lilycove City|90|7|c, Aqua Hideout|96|1|d, Route 122|80|16|w, Mt. Pyre|80|23|d,
    Route 123|68|21|r, Route 124|100|10|w, Mossdeep City|110|12|c, Route 125|110|4|w, Shoal Cave|117|0|d, Route 127|108|24|w, Route 126|98|24|w,
    Sootopolis City|98|32|c, Cave Of Origin|92|32|d, Underwater|102|30|w, Route 128|112|36|w, Seafloor Cavern|118|42|d, Ever Grande City|120|30|c,
    Victory Road|122|22|d, Route 129|104|44|w, Route 130|94|46|w, Route 131|84|46|w, Sky Pillar|84|38|d, Pacifidlog Town|76|46|c, Route 132|70|50|w,
    Route 133|62|52|w, Route 134|54|52|w, Sealed Chamber|56|58|d, Battle Frontier|66|62|d, Artisan Cave|72|66|d,
    Route 105|6|52|w, Route 106|8|62|w, Dewford Town|14|68|c, Granite Cave|7|72|d, Route 107|22|68|w, Route 108|32|69|w, Abandoned Ship|32|76|d, Route 109|42|58|w`,
  edges: `
    Littleroot Town>Route 101, Route 101>Oldale Town, Oldale Town>Route 103, Route 103>Altering Cave, Oldale Town>Route 102, Route 102>Petalburg City,
    Petalburg City>Route 104, Route 104>Petalburg Woods, Petalburg Woods>Rustboro City, Rustboro City>Route 115, Route 115>Meteor Falls, Meteor Falls>Route 114,
    Rustboro City>Route 116, Route 116>Rusturf Tunnel, Rusturf Tunnel>Verdanturf Town, Route 114>Fallarbor Town, Fallarbor Town>Route 113, Route 113>Route 111,
    Route 111>Desert Underpass, Route 111>Mirage Tower, Route 111>Route 112, Route 112>Jagged Pass, Jagged Pass>Magma Hideout, Jagged Pass>Lavaridge Town,
    Route 112>Fiery Path, Fiery Path>Route 111, Route 111>Mauville City, Verdanturf Town>Route 117, Route 117>Mauville City, Mauville City>Route 110,
    Route 110>New Mauville, Route 110>Slateport City, Route 103>Route 110, Mauville City>Route 118, Route 118>Route 119, Route 119>Fortree City,
    Fortree City>Route 120, Route 120>Scorched Slab, Route 120>Route 121, Route 121>Safari Zone, Route 121>Lilycove City, Lilycove City>Aqua Hideout,
    Route 121>Route 122, Route 122>Mt. Pyre, Route 122>Route 123, Route 123>Route 118, Lilycove City>Route 124, Route 124>Mossdeep City, Mossdeep City>Route 125,
    Route 125>Shoal Cave, Mossdeep City>Route 127, Route 124>Route 126, Route 126>Sootopolis City, Sootopolis City>Cave Of Origin, Route 126>Underwater,
    Route 127>Route 128, Route 128>Seafloor Cavern, Route 128>Ever Grande City, Ever Grande City>Victory Road, Route 128>Route 129, Route 129>Route 130,
    Route 130>Route 131, Route 131>Sky Pillar, Route 131>Pacifidlog Town, Pacifidlog Town>Route 132, Route 132>Route 133, Route 133>Route 134, Route 134>Slateport City,
    Route 134>Sealed Chamber, Slateport City~Battle Frontier, Battle Frontier>Artisan Cave, Route 104>Route 105, Route 105>Route 106, Route 106>Dewford Town,
    Dewford Town>Granite Cave, Dewford Town>Route 107, Route 107>Route 108, Route 108>Abandoned Ship, Route 108>Route 109, Route 109>Slateport City`,
};

const SINNOH = {
  nodes: `
    Twinleaf Town|20|70|c, Lake Verity|12|70|r, Route 201|28|66|r, Sandgem Town|36|66|c, Route 219|36|74|w, Route 220|44|80|w, Route 221|54|80|r,
    Route 202|36|58|r, Jubilife City|36|50|c, Route 218|26|50|w, Canalave City|16|50|c, Iron Island|8|42|d, Route 203|46|50|r, Oreburgh Gate|52|50|d,
    Oreburgh City|58|50|c, Oreburgh Mine|58|57|d, Route 207|58|42|r, Route 204|36|42|r, Ravaged Path|36|36|d, Floaroma Town|36|29|c, Route 205|40|22|r,
    Valley Windworks|48|27|r, Fuego Ironworks|30|22|d, Eterna Forest|44|15|d, Eterna City|52|13|c, Old Chateau|44|8|d, Route 206|52|25|r, Wayward Cave|46|33|d,
    Route 211|60|13|r, Mt. Coronet|66|23|d, Celestic Town|74|17|c, Route 208|72|42|r, Hearthome City|80|42|c, Route 209|88|38|r, Solaceon Town|94|44|c,
    Solaceon Ruins|100|48|d, Route 210|90|26|r, Route 215|100|22|r, Veilstone City|108|22|c, Route 214|110|34|r, Maniac Tunnel|116|36|d, Ruin Maniac Cave|117|30|d,
    Sendoff Spring|116|42|r, Turnback Cave|122|44|d, Valor Lakefront|108|46|r, Lake Valor|102|54|r, Route 213|96|60|w, Pastoria City|86|60|c, Great Marsh|86|68|d,
    Route 212|80|52|r, Trophy Garden|74|50|d, Route 222|116|58|r, Sunyshore City|124|58|c, Route 223|128|48|w, Pokémon League|128|38|c, Victory Road|128|30|d,
    Route 224|136|36|r, Route 216|62|4|r, Route 217|62|-6|r, Acuity Lakefront|62|-14|r, Snowpoint City|56|-20|c, Lake Acuity|68|-20|r, Snowpoint Temple|50|-26|d,
    Fight Area|128|4|c, Route 225|128|-4|r, Route 226|138|-2|w, Route 227|136|-10|r, Stark Mountain|136|-18|d, Route 228|126|-12|r, Route 229|120|-6|r,
    Resort Area|116|0|c, Route 230|124|10|w`,
  edges: `
    Twinleaf Town>Lake Verity, Twinleaf Town>Route 201, Route 201>Sandgem Town, Sandgem Town>Route 219, Route 219>Route 220, Route 220>Route 221,
    Sandgem Town>Route 202, Route 202>Jubilife City, Jubilife City>Route 218, Route 218>Canalave City, Canalave City~Iron Island, Jubilife City>Route 203,
    Route 203>Oreburgh Gate, Oreburgh Gate>Oreburgh City, Oreburgh City>Oreburgh Mine, Oreburgh City>Route 207, Route 207>Mt. Coronet, Jubilife City>Route 204,
    Route 204>Ravaged Path, Ravaged Path>Floaroma Town, Floaroma Town>Route 205, Route 205>Valley Windworks, Route 205>Fuego Ironworks, Route 205>Eterna Forest,
    Eterna Forest>Old Chateau, Eterna Forest>Eterna City, Eterna City>Route 206, Route 206>Wayward Cave, Route 206>Route 207, Eterna City>Route 211,
    Route 211>Mt. Coronet, Mt. Coronet>Celestic Town, Mt. Coronet>Route 208, Route 208>Hearthome City, Hearthome City>Route 209, Route 209>Solaceon Town,
    Solaceon Town>Solaceon Ruins, Route 209>Route 210, Route 210>Celestic Town, Route 210>Route 215, Route 215>Veilstone City, Veilstone City>Route 214,
    Route 214>Maniac Tunnel, Route 214>Ruin Maniac Cave, Route 214>Sendoff Spring, Sendoff Spring>Turnback Cave, Route 214>Valor Lakefront,
    Valor Lakefront>Lake Valor, Valor Lakefront>Route 213, Route 213>Pastoria City, Pastoria City>Great Marsh, Pastoria City>Route 212, Route 212>Hearthome City,
    Route 212>Trophy Garden, Valor Lakefront>Route 222, Route 222>Sunyshore City, Sunyshore City>Route 223, Route 223>Pokémon League, Pokémon League>Victory Road,
    Victory Road>Route 224, Mt. Coronet>Route 216, Route 216>Route 217, Route 217>Acuity Lakefront, Acuity Lakefront>Snowpoint City, Acuity Lakefront>Lake Acuity,
    Snowpoint City>Snowpoint Temple, Snowpoint City~Fight Area, Fight Area>Route 225, Route 225>Route 226, Route 225>Route 227, Route 227>Stark Mountain,
    Route 227>Route 228, Route 228>Route 229, Route 229>Resort Area, Fight Area>Route 230, Route 230>Resort Area`,
};

const UNOVA = {
  nodes: `
    Nuvema Town|62|78|c, Route 1|62|70|r, Accumula Town|62|62|c, Route 2|54|60|r, Striaton City|46|60|c, Dreamyard|46|53|d, Route 3|38|62|r,
    Wellspring Cave|36|69|d, Nacrene City|30|62|c, Pinwheel Forest|22|60|d, Skyarrow Bridge|16|54|r, Castelia City|14|47|c, Route 17|5|52|w,
    Route 18|0|60|r, P2 Laboratory|0|67|d, Route 4|18|38|r, Desert Resort|10|33|r, Relic Castle|4|27|d, Nimbasa City|24|30|c, Route 16|34|30|r,
    Lostlorn Forest|36|23|d, Marvelous Bridge|44|30|r, Route 15|54|32|r, Route 5|18|22|r, Driftveil Drawbridge|12|17|r, Driftveil City|6|12|c,
    Cold Storage|0|17|d, Route 6|6|4|r, Chargestone Cave|8|-4|d, Mistralton City|16|-8|c, Mistralton Cave|20|-1|d, Route 7|26|-8|r,
    Celestial Tower|24|-15|d, Twist Mountain|34|-8|d, Icirrus City|42|-8|c, Dragonspiral Tower|42|-17|d, Route 8|44|0|r, Moor Of Icirrus|38|3|r,
    Route 9|54|-6|r, Opelucid City|62|-6|c, Route 10|68|-12|r, Victory Road|72|-19|d, Challenger's Cave|64|-21|d, Trial Chamber|78|-23|d,
    Guidance Chamber|80|-15|d, Route 11|70|-2|r, Village Bridge|76|4|r, Route 12|80|10|r, Lacunosa Town|84|16|c, Giant Chasm|94|12|d,
    Route 13|88|24|r, Undella Town|88|34|c, Undella Bay|96|36|w, Route 14|80|40|r, Abundant Shrine|74|46|d, Black City|66|38|c`,
  edges: `
    Nuvema Town>Route 1, Route 1>Accumula Town, Accumula Town>Route 2, Route 2>Striaton City, Striaton City>Dreamyard, Striaton City>Route 3,
    Route 3>Wellspring Cave, Route 3>Nacrene City, Nacrene City>Pinwheel Forest, Pinwheel Forest>Skyarrow Bridge, Skyarrow Bridge>Castelia City,
    Castelia City>Route 17, Route 17>Route 18, Route 18>P2 Laboratory, Castelia City>Route 4, Route 4>Desert Resort, Desert Resort>Relic Castle,
    Route 4>Nimbasa City, Nimbasa City>Route 16, Route 16>Lostlorn Forest, Route 16>Marvelous Bridge, Marvelous Bridge>Route 15, Route 15>Black City,
    Nimbasa City>Route 5, Route 5>Driftveil Drawbridge, Driftveil Drawbridge>Driftveil City, Driftveil City>Cold Storage, Driftveil City>Route 6,
    Route 6>Chargestone Cave, Chargestone Cave>Mistralton City, Mistralton City>Mistralton Cave, Mistralton City>Route 7, Route 7>Celestial Tower,
    Route 7>Twist Mountain, Twist Mountain>Icirrus City, Icirrus City>Dragonspiral Tower, Icirrus City>Route 8, Route 8>Moor Of Icirrus, Route 8>Route 9,
    Route 9>Opelucid City, Opelucid City>Route 10, Route 10>Victory Road, Victory Road>Challenger's Cave, Victory Road>Trial Chamber, Victory Road>Guidance Chamber,
    Opelucid City>Route 11, Route 11>Village Bridge, Village Bridge>Route 12, Route 12>Lacunosa Town, Lacunosa Town>Giant Chasm, Lacunosa Town>Route 13,
    Route 13>Undella Town, Undella Town>Undella Bay, Undella Town>Route 14, Route 14>Abundant Shrine, Route 14>Black City`,
};

function parse(region) {
  const nodes = {};
  for (const item of region.nodes.split(",").map(s => s.trim()).filter(Boolean)) {
    const [name, x, y, kind] = item.split("|");
    nodes[name] = { name, x: +x, y: +y, kind };
  }
  const edges = region.edges.split(",").map(s => s.trim()).filter(Boolean).map(e => {
    const ferry = e.includes("~");
    const [a, b] = e.split(/[>~]/).map(s => s.trim());
    if (!nodes[a] || !nodes[b]) throw new Error(`Liaison inconnue : ${e}`);
    return { a, b, ferry };
  });
  return { nodes, edges };
}

// Index des régions dans les données : 0 Kanto, 1 Johto, 2 Hoenn, 3 Sinnoh, 4 Unys
export const REGION_MAPS = [KANTO, JOHTO, HOENN, SINNOH, UNOVA].map(parse);

// Zones affichées séparément : Kanto continental et les Îles Sevii (x ≥ 100 sur le schéma)
export const AREAS = [
  [{ id: "kanto", fr: "Kanto", en: "Kanto", test: n => n.x < 98 }, { id: "sevii", fr: "Îles Sevii", en: "Sevii Islands", test: n => n.x >= 98 }],
  [{ id: "johto", test: () => true }],
  [{ id: "hoenn", test: () => true }],
  [{ id: "sinnoh", test: () => true }],
  [{ id: "unova", test: () => true }],
];

// Nom de base d'un lieu des données : « Ilex Forest (Day/Morning) » → « Ilex Forest »
export const baseName = en => en.replace(/\s*\(.*?\)\s*/g, " ").trim();

// Villes de départ sans Centre Pokémon
const NO_CENTER = new Set(["Pallet Town", "New Bark Town", "Littleroot Town", "Twinleaf Town", "Nuvema Town"]);
export const hasCenter = node => node?.kind === "c" && !NO_CENTER.has(node.name);

// Chemin le plus court depuis la ville (Centre Pokémon) la plus proche
export function accessPath(regionIdx, target) {
  const map = REGION_MAPS[regionIdx];
  if (!map?.nodes[target]) return null;
  const adj = {};
  for (const { a, b, ferry } of map.edges) {
    (adj[a] ||= []).push({ to: b, ferry });
    (adj[b] ||= []).push({ to: a, ferry });
  }
  if (hasCenter(map.nodes[target])) return [target];
  const prev = { [target]: null };
  const queue = [target];
  while (queue.length) {
    const cur = queue.shift();
    if (cur !== target && hasCenter(map.nodes[cur])) {
      const path = [cur];
      let p = prev[cur];
      while (p != null) { path.push(p); p = prev[p]; }
      return path; // de la ville vers le lieu
    }
    for (const { to } of adj[cur] || []) if (!(to in prev)) { prev[to] = cur; queue.push(to); }
  }
  return [target];
}
