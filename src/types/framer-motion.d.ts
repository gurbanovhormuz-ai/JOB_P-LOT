import * as React from "react";

declare module "framer-motion" {
  export interface MotionProps {
    initial?: any;
    animate?: any;
    exit?: any;
    transition?: any;
    variants?: any;
    whileHover?: any;
    whileTap?: any;
    whileInView?: any;
    whileFocus?: any;
    whileDrag?: any;
    layout?: any;
    layoutId?: any;
    custom?: any;
    viewport?: any;
    style?: any;
    className?: any;
    children?: React.ReactNode;
    key?: React.Key;
    [key: string]: any;
  }

  export type HTMLMotionProps<Tag extends keyof React.JSX.IntrinsicElements = any> =
    (Tag extends keyof React.JSX.IntrinsicElements ? React.JSX.IntrinsicElements[Tag] : React.HTMLAttributes<HTMLElement>) & MotionProps;

  export type SVGMotionProps<Tag extends keyof React.JSX.IntrinsicElements = any> =
    (Tag extends keyof React.JSX.IntrinsicElements ? React.JSX.IntrinsicElements[Tag] : React.SVGAttributes<SVGElement>) & MotionProps;

  export const motion: {
    [key: string]: any;
  } & {
    [K in keyof React.JSX.IntrinsicElements]: React.ForwardRefExoticComponent<any>;
  };

  export const AnimatePresence: React.FC<{
    children?: React.ReactNode;
    mode?: "sync" | "popLayout" | "wait";
    initial?: boolean;
    onExitComplete?: () => void;
    [key: string]: any;
  }>;

  export const useAnimation: () => any;
  export const useMotionValue: (initial: any) => any;
  export const useTransform: (...args: any[]) => any;
}
