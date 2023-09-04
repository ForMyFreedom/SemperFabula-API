// import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import type { ResponseContract } from '@ioc:Adonis/Core/Response'
import Event from '@ioc:Adonis/Core/Event'
import ExceptionHandler from 'App/Exceptions/Handler'
import Genre from 'App/Models/Genre'
import Prompt from 'App/Models/Prompt'
import Write from 'App/Models/Write'
import { PromptValidator } from 'App/Validators/PromptValidator'

export default class PromptsController {
  public async index({ response }: HttpContextContract): Promise<void> {
    const prompts = await Prompt.all()
    ExceptionHandler.SucessfullyRecovered(response, prompts)
  }

  public async show({ response, params }: HttpContextContract): Promise<void> {
    try {
      const prompt = await Prompt.findOrFail(params.id)
      await prompt.load('genres')
      await prompt.write.load('author')
      delete prompt.write.$attributes.authorId
      ExceptionHandler.SucessfullyRecovered(response, prompt)
    } catch (e) {
      ExceptionHandler.UndefinedId(response)
    }
  }

  public async store(ctx: HttpContextContract): Promise<void> {
    const { response, auth } = ctx
    const { genreIds, text, ...body } = await new PromptValidator(ctx).validate()
    const authorId = auth?.user?.id
    if (authorId) {
      const write = await Write.create({ text: text, authorId: authorId })
      const prompt = await Prompt.create({ ...body, writeId: write.id })
      if (await replaceGenres(response, prompt, genreIds)) {
        prompt.save()
        Event.emit('run:prompt', prompt)
        await prompt.load('write')
        return ExceptionHandler.SucessfullyCreated(response, prompt)
      }
    } else {
      ExceptionHandler.InvalidUser(response)
    }
  }

  public async update(ctx: HttpContextContract): Promise<void> {
    const { response, params, auth } = ctx
    const prompt = await Prompt.find(params.id)
    const { genreIds, text, limitOfExtensions, ...body } = await new PromptValidator(
      ctx
    ).validateAsOptional()
    if (prompt) {
      if (prompt.write.authorId !== auth?.user?.id) {
        return ExceptionHandler.CantEditOthersWrite(response)
      }

      if (prompt.isDaily) {
        return ExceptionHandler.CantEditDailyPrompt(response)
      }

      if (prompt.currentIndex === 0) {
        if (text) {
          await Write.updateOrCreate({ id: prompt.write.id }, { text: text, edited: true })
        }
        if (limitOfExtensions) {
          prompt.limitOfExtensions = limitOfExtensions
        }
        if (genreIds && genreIds.length > 0) {
          await prompt.related('genres').detach()
          if (!(await replaceGenres(response, prompt, genreIds))) {
            return
          }
        }
      }
      prompt.merge(body)
      await prompt.save()
      await prompt.load('write')
      ExceptionHandler.SucessfullyUpdated(response, prompt)
    } else {
      ExceptionHandler.UndefinedId(response)
    }
  }

  public async destroy({ response, params, auth }: HttpContextContract): Promise<void> {
    const prompt = await Prompt.find(params.id)
    if (prompt) {
      if (prompt.write.authorId === auth?.user?.id) {
        await prompt.write.delete()
        ExceptionHandler.SucessfullyDestroyed(response, prompt)
      } else {
        ExceptionHandler.CantDeleteOthersWrite(response)
      }
    } else {
      ExceptionHandler.UndefinedId(response)
    }
  }
}

const replaceGenres = async (
  response: ResponseContract,
  prompt: Prompt,
  genreIds: Genre['id'][]
): Promise<boolean> => {
  try {
    await prompt.related('genres').attach(genreIds)
    await prompt.load('genres')
    return true
  } catch (e) {
    ExceptionHandler.InvalidGenre(response)
    return false
  }
}
