import {
  bufferToFile,
  cliExecute,
  drink,
  getProperty,
  itemAmount,
  myAdventures,
  print,
  pvpAttacksLeft,
  retrieveItem,
  setProperty,
  Skill,
  toJson,
  useSkill,
  visitUrl,
} from "kolmafia";
import { Engine, Guards, Task } from "grimoire-kolmafia";
import { $effect, $item, AugustScepter, getAcquirePrice, getRemainingLiver, set } from "libram";
import { getRafflePrizes } from "libram/dist/resources/evergreen/Raffle";
import { canCast } from "libram/dist/resources/2023/AugustScepter";

const TaskUpdateScripts: Task = {
  name: "Update scripts",
  completed: () => false,
  do: () => {
    cliExecute("git checkout loathers/garbage-collector.git release");
    cliExecute("git checkout https://github.com/Pantocyclus/PVP_MAB.git release");
    cliExecute("git checkout bearsdotzone/CONSUME.ash");
    cliExecute("git update");
  },
  limit: { skip: 1 },
};

const TaskDoPVP: Task = {
  name: "Do PVP Fights",
  completed: () => pvpAttacksLeft() === 0,
  do: () => cliExecute("pvp_mab target=fame"),
  post: () => {
    cliExecute("timein");
  },
  limit: { skip: 5 },
};

const tequizNavidad = $item`Tequiz Navidad`;
const buyPrice = 10000;

const TaskDoDiet: Task = {
  name: "Drink tequiz navidads",
  completed: () => getRemainingLiver() < 2,
  do: () => {
    drink(tequizNavidad);
  },
  effects: [$effect`Ode to Booze`],
  ready: () => getAcquirePrice(tequizNavidad) < buyPrice && retrieveItem(tequizNavidad),
};

const TaskDoBounties: Task = {
  name: "Do bounties",
  completed: () => false,
  do: () => cliExecute("bountiful hunt optimal"),
  prepare: () => {
    setProperty("bountiful.automaticallyGiveup", "true");
    setProperty("bountiful.maxBanishCost", "30000");
    setProperty("bountiful.useBanisher", "true");
    setProperty("bountiful.useCopier", "true");
    setProperty("bountiful.useFax", "true");
  },
  limit: { skip: 1 },
};

// Consider adding crimbo targets
// moai for moaiball
// section 11 for cmoi (tough fight)
// pumpkin spice wraith for pumpkin spice whorl
// magically-animated snowman for snowman-enchanting top hat
const TaskDoGarbo: Task = {
  name: "Do garbo",
  completed: () => getRemainingLiver() < 0 || myAdventures() === 0,
  do: () => {
    let garboString = "garbo";
    if (itemAmount($item`moaiball`) < 2) {
      garboString += ' target="moai"';
    } else if (itemAmount($item`pumpkin spice whorl`) < 2) {
      garboString += ' target="pumpkin spice wraith"';
    } else if (itemAmount($item`snowman-enchanting tophat`) < 2) {
      garboString += ' target="magically-animated snowman"';
    }

    cliExecute(garboString);
  },
  prepare: () => {
    setProperty("garbo_vipClan", "90485");
    setProperty("valueOfAdventure", "3501");
    setProperty("garboDisallowIceHouseNotify", "true");
    setProperty("garbo_autoUserConfirm", "true");
  },
  limit: { skip: 5 },
};

const TaskDoOverdrink: Task = {
  name: "Do overdrink",
  completed: () => getRemainingLiver() < 0,
  do: () => cliExecute("CONSUME NIGHTCAP"),
  ready: () => getRemainingLiver() === 0 && myAdventures() === 0,
  limit: { skip: 1 },
};

const TaskDoPajamas: Task = {
  name: "Do pajamas",
  completed: () => false,
  do: () => {},
  outfit: { modifier: "adv, 0.3 pvp fights -tie" },
  limit: { skip: 1 },
  prepare: () => {
    if (AugustScepter.canCast(13)) useSkill(<Skill>AugustScepter.SKILLS.at(13));
  },
};

const TaskDoRaffle: Task = {
  name: "Do raffle",
  completed: () => itemAmount($item`raffle ticket`) >= 1,
  do: () => {
    cliExecute("raffle 1");
  },
  limit: { skip: 1 },
};

export function main(): void {
  cliExecute("login bearsdotzone");

  setProperty("choiceAdventure1065", "3");
  setProperty("choiceAdventure546", "12");
  setProperty("choiceAdventure1201", "2");
  setProperty("_eldritchTentacleFought", "true");

  const engine = new Engine([
    TaskUpdateScripts,
    TaskDoPVP,
    TaskDoDiet,
    TaskDoBounties,
    TaskDoGarbo,
    TaskDoOverdrink,
    TaskDoPajamas,
    TaskDoRaffle,
  ]);
  engine.run();

  let errors = "";
  if (myAdventures() > 50) errors = errors.concat("Too many adventures!");
  if (pvpAttacksLeft() > 0) errors = errors.concat("Too many PVP fights!");
  if (getRemainingLiver() >= 0) errors = errors.concat("Too much liver!");
  if (errors.length > 0) {
    bufferToFile(JSON.stringify({ content: errors }), "output.txt");
  }

  cliExecute("exit");
}
