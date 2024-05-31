export interface BundleOptions {
  debug?: boolean
  skipHidden?: boolean
  include?: string
  exclude?: string
  filenames?: string
  output?: string
  input?: string
  depth?: string
}

export interface HelpOptions {
  [key: string]: any
}

export interface DefaultOptions {
  [key: string]: any
}

export type Options<T extends DefaultOptions = DefaultOptions> = T
