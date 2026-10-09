/// <reference types="react" />

declare namespace JSX {
  interface IntrinsicElements extends React.JSX.IntrinsicElements {}
}

declare module "next" {
  export interface NextConfig {
    [key: string]: any;
  }
  export type Metadata = {
    title?: string | { default: string; template: string };
    description?: string;
    icons?: any;
    [key: string]: any;
  };
  export default function next(options?: any): any;
}

declare module "next/server" {
  export class NextRequest extends Request {
    [key: string]: any;
  }
  export class NextResponse extends Response {
    static json(body: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static next(init?: any): NextResponse;
  }
}

declare module "next/server.js" {
  export * from "next/server";
}

declare module "next/types.js" {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
  export type * from "next";
}

declare module "next/font/google" {
  export function Geist(options?: any): { variable: string; className: string };
  export function Geist_Mono(options?: any): { variable: string; className: string };
  export function Inter(options?: any): { variable: string; className: string };
  export function Plus_Jakarta_Sans(options?: any): { variable: string; className: string };
}

declare module "next/link" {
  import * as React from "react";
  const Link: React.ForwardRefExoticComponent<
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
      href: string;
      replace?: boolean;
      scroll?: boolean;
      prefetch?: boolean;
      children?: React.ReactNode;
      className?: string;
    } & React.RefAttributes<HTMLAnchorElement>
  >;
  export default Link;
}

declare module "next/navigation" {
  export function useRouter(): {
    push(href: string): void;
    replace(href: string): void;
    back(): void;
    forward(): void;
    refresh(): void;
    prefetch(href: string): void;
  };
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
  export function useParams<T = Record<string, string | string[]>>(): T;
  export function redirect(url: string): never;
  export function notFound(): never;
}

declare module "pdf-parse" {
  export default function pdfParse(
    dataBuffer: Buffer,
    options?: any
  ): Promise<{
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }>;
}

declare module "groq-sdk" {
  export default class Groq {
    constructor(options?: any);
    chat: {
      completions: {
        create(params: any): Promise<any>;
      };
    };
    [key: string]: any;
  }
}
