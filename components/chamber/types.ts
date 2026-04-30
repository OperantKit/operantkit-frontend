export type SceneKind =
  | "FR"
  | "FI"
  | "VI"
  | "VR"
  | "DRL"
  | "DRH"
  | "DRO"
  | "CONC";

export type LightState = "off" | "on" | "blink";

export const IMPLEMENTED_KINDS: readonly SceneKind[] = ["FR", "FI", "VI"] as const;

export interface ChamberLeverProps {
  disabled?: boolean;
  pressed?: boolean;
  onPress?: () => void;
  onRelease?: () => void;
  ariaLabel?: string;
}

export interface ChamberLightProps {
  state: LightState;
}

export interface PelletDropProps {
  trigger: number;
}

export interface ChamberSceneProps {
  kind: SceneKind;
  onResponse: (side?: "L" | "R") => void;
  reinforcedSeq: number;
  disabled?: boolean;
}
