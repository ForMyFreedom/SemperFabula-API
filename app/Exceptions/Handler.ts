/*
|--------------------------------------------------------------------------
| Http Exception Handler
|--------------------------------------------------------------------------
|
| AdonisJs will forward all exceptions occurred during an HTTP request to
| the following class. You can learn more about exception handling by
| reading docs.
|
| The exception handler extends a base `HttpExceptionHandler` which is not
| mandatory, however it can do lot of heavy lifting to handle the errors
| properly.
|
*/

import Logger from '@ioc:Adonis/Core/Logger'
import HttpExceptionHandler from '@ioc:Adonis/Core/HttpExceptionHandler'
import type { ResponseContract } from '@ioc:Adonis/Core/Response'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

type ErrorTreater = { response: object; errorTreater: (body: any) => void }
type ErrorHandlers = { [key: string]: (error: any, response: ResponseContract) => ErrorTreater }

export default class ExceptionHandler extends HttpExceptionHandler {
  constructor() {
    super(Logger)
  }

  private basicHandlers: ErrorHandlers = {
    E_ROUTE_NOT_FOUND: (_error, r) => ({
      response: { error: 'Route not found' },
      errorTreater: r.badRequest.bind(r),
    }),
    E_VALIDATION_FAILURE: (error, r) => ({
      response: { error: 'Validation failure', failures: error.messages },
      errorTreater: r.badRequest.bind(r),
    }),
    E_AUTHORIZATION_FAILURE: (_error, r) => ({
      response: { error: 'Unauthorized' },
      errorTreater: r.unauthorized.bind(r),
    }),
  }

  public async handle(error: any, { response }: HttpContextContract): Promise<any> {
    if (error && error.code) {
      const basicResponse = this.basicHandlers[error.code]
      if (basicResponse) {
        const responseHandler = basicResponse(error, response)
        responseHandler.errorTreater(responseHandler.response)
      } else {
        response.badRequest(error)
      }
    }
  }

  public static SucessfullyCreated(response: ResponseContract, body: any): void {
    response.created({ message: 'Sucessfully created', data: body })
  }

  public static SuccessfullyAuthenticated(response: ResponseContract): void {
    response.accepted({ message: 'Successfully authenticated' })
  }

  public static SucessfullyUpdated(response: ResponseContract, body: any): void {
    response.accepted({ message: 'Sucesfully updated', data: body })
  }

  public static SucessfullyRecovered(response: ResponseContract, body: any): void {
    response.accepted({ message: 'Sucessfully recovered', data: body })
  }

  public static SucessfullyDestroyed(response: ResponseContract, body: any): void {
    response.accepted({ message: 'Sucessfully destroyed', data: body })
  }

  public static UndefinedId(response: ResponseContract): void {
    response.notFound({ error: 'Id not Defined' })
  }

  public static UndefinedWrite(response: ResponseContract): void {
    response.notFound({ error: 'Write not Defined' })
  }

  public static UndefinedComment(response: ResponseContract): void {
    response.notFound({ error: 'Comment not Defined' })
  }

  public static CantDeleteOthersWrite(response: ResponseContract): void {
    response.badRequest({ error: "You can't delete others write!" })
  }

  public static CantEditOthersWrite(response: ResponseContract): void {
    response.badRequest({ error: "You can't edit others write!" })
  }

  public static CantEditOtherUser(response: ResponseContract): void {
    response.badRequest({ error: "You can't edit others users!" })
  }

  public static CantDeleteOthersReaction(response: ResponseContract): void {
    response.badRequest({ error: "You can't delete others reaction!" })
  }

  public static ImageError(response: ResponseContract): void {
    response.badRequest({ error: 'Image error' })
  }

  public static InvalidAuth(response: ResponseContract): void {
    response.unauthorized({ error: 'Invalid Auth' })
  }

  public static InvalidUser(response: ResponseContract): void {
    response.badRequest({ message: 'There is no user with that userId' })
  }

  public static InvalidGenre(response: ResponseContract): void {
    response.badRequest({ message: 'There is no genre with that genreId' })
  }

  public static FileNotFound(response: ResponseContract): void {
    response.notFound({ error: 'File not found' })
  }

  public static CantProposeToClosedHistory(response: ResponseContract): void {
    response.badRequest({ error: "Can't propose to closed fable" })
  }

  public static IncompatibleWriteAndAnswer(response: ResponseContract): void {
    response.badRequest({ error: 'The comment you want to reply to does not belong to this write' })
  }

  public static CantUseConclusiveReactionInComment(response: ResponseContract): void {
    response.badRequest({ error: "Can't use conclusive reaction in comment" })
  }

  public static CantUseConclusiveReactionInPrompt(response: ResponseContract): void {
    response.badRequest({ error: "Can't use conclusive reaction in prompt" })
  }

  public static TextLengthHigherThanAllowed(response: ResponseContract): void {
    response.badRequest({ error: 'Text length higher than allowed' })
  }

  public static CantUseConclusiveReactionInConcludedHistory(response: ResponseContract): void {
    response.badGateway({ error: "Can't use conclusive reaction in concluded history" })
  }

  public static NotAppropriablePrompt(response: ResponseContract): void {
    response.badRequest({ error: 'This is not an appropriable prompt!' })
  }

  public static TextDontRespectPrompt(response: ResponseContract): void {
    response.badRequest({ error: "Your text don't respect prompt" })
  }

  public static CantEditDailyPrompt(response: ResponseContract): void {
    response.badRequest({ error: "Can't edit a daily prompt!" })
  }

  public static CantProposeToUnappropriatedPrompt(response: ResponseContract): void {
    response.badRequest({ error: "Can't proposoe to unappropriated prompt" })
  }
}
