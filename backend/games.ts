import { FourInarowGame } from "./games/fourInarowGame";
import { PokerGame } from "./games/pokergame";

export const Games = {
    POKER: PokerGame,
    FOURINAROW: FourInarowGame,
    // when more games are added, add them here
} as const;
