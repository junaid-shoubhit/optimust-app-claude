// src/components/CardList/cardRegistry.js

import DefaultCard from "./cards/DefaultCard";
import TaskCard from "./cards/TaskCard";

export const CARD_REGISTRY = {
  default: DefaultCard,
  "/workflows": TaskCard,
};
