import type { ParameterValues } from '../_routes/routes'
import {
  buildPath,
  defaultConfiguration,
  type DefaultConfiguration,
} from '../routes'

describe('routes', () => {
  describe('buildPath', () => {
    describe('with default configuration', () => {
      const build = <T extends string>(
        path: T,
        parameters?: ParameterValues<T, DefaultConfiguration>,
        query?: Record<string, string | number | boolean>,
      ) =>
        buildPath<T, DefaultConfiguration>(
          path,
          defaultConfiguration,
          parameters,
          query,
        )

      it('generates correct routes', () => {
        expect(build(':a', { a: '1' })).toEqual('1')
        expect(build(':a/:b', { a: '1', b: 2 })).toEqual('1/2')
        expect(build(':a/n/:b', { a: '1', b: 2 })).toEqual('1/n/2')
        expect(build(':a/n/:b/m', { a: '1', b: 2 })).toEqual('1/n/2/m')
        expect(build('n/m')).toEqual('n/m')
        expect(build('n/:a', { a: '1' })).toEqual('n/1')
        expect(build(':a/:a', { a: '1' })).toEqual('1/1')
      })

      it('generates routes with query', () => {
        expect(build(':a/:b', { a: '1', b: 2 }, { x: 12, y: '30' })).toEqual(
          '1/2?x=12&y=30',
        )
      })
    })

    describe('with custom configuration', () => {
      type Configuration = {
        variableStart: '${'
        variableEnd: '}'
      }
      const build = <T extends string>(
        path: T,
        parameters?: ParameterValues<T, Configuration>,
        query?: Record<string, string | number | boolean>,
      ) =>
        buildPath<T, Configuration>(
          path,
          {
            variableStart: '${',
            variableEnd: '}',
          },
          parameters,
          query,
        )

      it('generates correct routes', () => {
        expect(build('${a}', { a: '1' })).toEqual('1')
        expect(build('${a}/${b}', { a: '1', b: 2 })).toEqual('1/2')
        expect(build('${a}/n/${b}', { a: '1', b: 2 })).toEqual('1/n/2')
        expect(build('${a}/n/${b}/m', { a: '1', b: 2 })).toEqual('1/n/2/m')
        expect(build('n/m')).toEqual('n/m')
        expect(build('n/${a}', { a: '1' })).toEqual('n/1')
        expect(build('${a}/${a}', { a: '1' })).toEqual('1/1')
      })

      it('generates routes with query', () => {
        expect(
          build('${a}/${b}', { a: '1', b: 2 }, { x: 12, y: '30' }),
        ).toEqual('1/2?x=12&y=30')
      })
    })
  })
})
