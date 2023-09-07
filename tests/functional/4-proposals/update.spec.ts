import { TestContext } from '@japa/runner'
import { BASE_URL, EDIT_SAMPLE_PROPOSAL, postProposal } from './_data'
import { testPUTUnauthenticated } from '../_utils/basic-tests/unauthenticated'
import { testPUTUndefinedId } from '../_utils/basic-tests/undefined-id'
import { testPUTOthersWrite } from '../_utils/basic-tests/others-write'
import { testPUTAccepted } from '../_utils/basic-tests/accepted'

async function testProposalUpdate({ client }: TestContext): Promise<void> {
  const proposal = await postProposal(client, true)
  const otherProposal = await postProposal(client, false)

  await testPUTUnauthenticated(client, BASE_URL, proposal.id, EDIT_SAMPLE_PROPOSAL)
  await testPUTUndefinedId(client, BASE_URL, EDIT_SAMPLE_PROPOSAL)
  await testPUTOthersWrite(client, BASE_URL, otherProposal.id, EDIT_SAMPLE_PROPOSAL)
  await testPUTAccepted(client, BASE_URL, proposal.id, EDIT_SAMPLE_PROPOSAL)
}

export default testProposalUpdate