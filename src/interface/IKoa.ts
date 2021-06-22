import Koa from 'koa'
import render from 'koa-art-template'

export interface Context extends Koa.Context {
  render: typeof render
}