import { MiddlewareAPI } from "redux";

declare module "redux" {
  export interface GetState {
    <S>(): S;
  }
}
