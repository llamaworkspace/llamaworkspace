// src/app/api/rolldice/route.ts

import { NextResponse } from "next/server";

function getRandomNumber(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min) + min);
}

export async function GET() {
  const diceRoll = getRandomNumber(1, 6);
  return NextResponse.json(diceRoll.toString());
}
