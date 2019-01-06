export class PlayerData {
  cellCount: number;
  shipHealth: number;
  shipMaxHealth: number;

  attackCount: number;

  attackDamageMin: number;
  attackDamageMax: number;
  criticalChance: number;

  protectCount: number;
  protectMultiplier: number;

  items: {
    type: ItemType;
    count: number;
  }[];

  credits: number;
}

export enum ItemType { Heal, MoreAttackCount, MoreProtectCount, IncreaseCriticalChance }
