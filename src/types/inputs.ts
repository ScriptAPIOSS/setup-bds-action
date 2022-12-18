import * as core from '@actions/core'

export const EULA_ACCEPT: string = core.getInput('EULA_ACCEPT')
export const PP_ACCEPT: string = core.getInput('PP_ACCEPT')
export const BDS_VERSION: string = core.getInput('BDS_VERSION')
export const BDS_CHANNEL: string = core.getInput('BDS_CHANNEL')
export const DOWNLOAD_PATH = core.getInput('DOWNLOAD_PATH', {required: true})