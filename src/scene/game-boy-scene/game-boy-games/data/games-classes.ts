import Portfolio from "../games/portfolio/portfolio";
import SpaceInvaders from "../games/space-invaders/space-invaders";
import Tetris from "../games/tetris/tetris";
import Zelda from "../games/zelda/zelda";
import { GAME_TYPE } from "./games-config";

const GAMES_CLASSES = {
  [GAME_TYPE.Tetris]: Tetris,
  [GAME_TYPE.Zelda]: Zelda,
  [GAME_TYPE.SpaceInvaders]: SpaceInvaders,
  [GAME_TYPE.Portfolio]: Portfolio,
}

export { GAMES_CLASSES };
