declare module 'koa-art-template' {
  function render<T>(app: string | object, options: T | render.DefaultSettings): any
  namespace render {
    interface DefaultSettings {
      root: string;
      extname: string;
    }
  }

  export default render
}