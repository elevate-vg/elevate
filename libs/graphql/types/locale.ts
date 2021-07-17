import { objectType, enumType } from 'nexus'
import { Language as LanguageType } from 'libs/types/Plugin'

const Language = enumType({
   name: 'Language',
   members: LanguageType,
})

const Translation = objectType({
   name: 'Translation',
   definition(t) {
      t.nonNull.string('name')
      t.nonNull.field('language', {
         type: 'Language',
      })
   },
})

export const types = [Language, Translation]
