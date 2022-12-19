export interface VersionManifest {
  commit_hash: string
  build_id: string
  date: Date
  version: string
  platform: string
  sha1: string
  size_in_bytes: number
  download_url: string
  release_notes: string
}
