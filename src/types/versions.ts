export interface Linux {
  stable: string
  preview: string
  versions: string[]
  preview_versions: string[]
}

export interface Windows {
  stable: string
  preview: string
  versions: string[]
  preview_versions: string[]
}

export interface VersionsJson {
  linux: Linux
  windows: Windows
}
