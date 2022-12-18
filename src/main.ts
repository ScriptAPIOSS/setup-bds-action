import * as core from '@actions/core'
import * as tc from '@actions/tool-cache'
import * as http from '@actions/http-client'

import {VersionsJson} from './types/versions'
import {VersionManifest} from './types/version-manifest'
import {BDS_CHANNEL, BDS_VERSION, DOWNLOAD_PATH, EULA_ACCEPT, PP_ACCEPT} from './types/inputs'

const VERSIONS_URL =
  'https://raw.githubusercontent.com/Bedrock-OSS/BDS-Versions/main/versions.json'

async function run(): Promise<void> {
  try {
    switch (process.platform) {
      case 'win32': {
        throw new Error('Unsupported platform: ${process.platform}')
      }
      case 'darwin': {
        throw new Error('Unsupported platform: ${process.platform}')
      }
    }



    if (EULA_ACCEPT !== 'true') {
      throw new Error(`Accept the EULA before continuing`)
    }

    if (PP_ACCEPT !== 'true') {
      throw new Error(`Accept the Privacy Policy before continuing`)
    }

    let MOD_BDS_VERSION = BDS_VERSION;

    if (BDS_VERSION === undefined || BDS_VERSION === '') {
      MOD_BDS_VERSION = 'latest'
    }

    const USE_LATEST = MOD_BDS_VERSION === 'latest'
    const USE_PREVIEW = BDS_CHANNEL === 'preview'

    if (USE_LATEST) {
      core.debug('Using latest')
    }

    // Validate channel
    switch (BDS_CHANNEL) {
      case 'stable': {
        break
      }
      case 'preview': {
        break
      }
      default: {
        throw new Error(`Invalid BDS_CHANNEL: ${BDS_CHANNEL}`)
      }
    }

    const _http = new http.HttpClient('http-client-tests')

    core.debug(`Pulling versions.json for latest version info`)

    const versions_response: http.HttpClientResponse = await _http.get(
      VERSIONS_URL
    )

    if (versions_response.message.statusCode !== 200) {
      throw new Error(
        `Bad response code while pulling versions.json: ${versions_response.message.statusCode}`
      )
    }

    const version_response_body: string = await versions_response.readBody()
    const versions: VersionsJson = JSON.parse(version_response_body)

    let target_version = MOD_BDS_VERSION

    // Sanity check version exists
    if (USE_LATEST) {
      if (USE_PREVIEW) {
        target_version = versions.linux.preview
      } else {
        target_version = versions.linux.stable
      }
    } else {
      if (USE_PREVIEW) {
        if (!versions.linux.preview_versions.includes(target_version)) {
          throw new Error(
            `Unknown version for channel: ${target_version} [${BDS_CHANNEL}]`
          )
        }
      } else {
        if (!versions.linux.versions.includes(target_version)) {
          throw new Error(
            `Unknown version for channel: ${target_version} [${BDS_CHANNEL}]`
          )
        }
      }
    }

    core.debug(
      `Downloading bds version ${target_version} on channel ${BDS_CHANNEL}`
    )

    let version_url =
      'https://raw.githubusercontent.com/Bedrock-OSS/BDS-Versions/main/linux'

    if (USE_PREVIEW) {
      version_url += '_preview'
    }

    version_url += `/${target_version}.json`

    const version_manifest_response: http.HttpClientResponse = await _http.get(
      version_url
    )

    if (version_manifest_response.message.statusCode !== 200) {
      throw new Error(
        `Bad response code while pulling version manifest: ${versions_response.message.statusCode}`
      )
    }

    const version_manifest_response_body: string =
      await version_manifest_response.readBody()
    const versions_manifest: VersionManifest = JSON.parse(
      version_manifest_response_body
    )

    const bds_zip = await tc.downloadTool(versions_manifest.download_url)
    const bdsExtractedPath = await tc.extractZip(bds_zip, DOWNLOAD_PATH)

    const bdsCachedPath = await tc.cacheDir(
      bdsExtractedPath,
      'bds',
      target_version
    )
    core.addPath(bdsCachedPath)

    core.setOutput('DOWNLOAD_PATH', DOWNLOAD_PATH)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
