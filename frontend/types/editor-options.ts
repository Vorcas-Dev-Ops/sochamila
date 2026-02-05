import { TextStyle } from "./editor";

export interface TextOptions {
  fontSize: number;
  fontFamily: string;
  fontWeight: number;
  color: string;
  opacity: number;
  letterSpacing: number;
  lineHeight: number;
  textStyle: TextStyle;
  curve: number;
}
