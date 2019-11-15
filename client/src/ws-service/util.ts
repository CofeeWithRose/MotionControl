export const tt = (fun: (...params:any[]) => void, limit: number) => {
    let lasteTime = 0
    return (...params: any[]) => {
      const now = Date.now()
      if(now - lasteTime > limit){
        fun(...params)
        lasteTime = now
      }
    }
  }