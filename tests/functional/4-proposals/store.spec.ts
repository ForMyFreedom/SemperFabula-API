import HTTP from "http-status-enum"
import { TestContext } from '@japa/runner'
import { BASE_URL, SAMPLE_PROPOSAL, WRONG_SAMPLE_PROPOSAL } from './_data'
import { testPOSTUnauthenticated } from '../_utils/basic-tests/unauthenticated'
import { testPOSTUnacceptedBody } from '../_utils/basic-tests/unaccepted-body'
import { testPOSTAccepted } from '../_utils/basic-tests/accepted'
import { postPrompt } from '../3-prompts/_data'
import { ApiClient } from '@japa/api-client/build/src/client'
import { ConnectionType, postWithAuth } from '../_utils/basic-auth-requests'

async function testProposalStore({ client }: TestContext): Promise<void> {
  await testPOSTUnauthenticated(client, BASE_URL, SAMPLE_PROPOSAL)
  await testPOSTUnacceptedBody(client, BASE_URL, WRONG_SAMPLE_PROPOSAL)
  SAMPLE_PROPOSAL.promptId = -1
  await testWriteNotDefined(client, BASE_URL, SAMPLE_PROPOSAL)

  const prompt = await postPrompt(client)
  SAMPLE_PROPOSAL.promptId = prompt.id

  await testPOSTAccepted(client, BASE_URL, SAMPLE_PROPOSAL, ConnectionType.Admin)
  await testPOSTAccepted(client, BASE_URL, SAMPLE_PROPOSAL, ConnectionType.NonAdmin)
}

async function testWriteNotDefined(
  client: ApiClient, url: string, body: object
): Promise<void> {
  let response = await postWithAuth(url, client, ConnectionType.Admin, body)
  response.assertStatus(HTTP.NOT_FOUND)
  response.assertBodyContains({ error: 'UndefinedWrite' })
}

export default testProposalStore