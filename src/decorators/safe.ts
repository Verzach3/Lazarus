import { stat } from "fs/promises";
import path from "path";

export function SafeURL(argIndex?: number) {
  if (argIndex === undefined) argIndex = 1;
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod: Function = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      try {
        await stat(path.join(args[argIndex!]));
        originalMethod.apply(this, args);
      } catch (e) {
        console.error(e);
      }
    };
  };
}
