import { MotionTypes, MotionInfo } from "../Motion";

export class ResultRenerData {

    constructor(private MAX: number) { }

    protected readonly motionInfoList: MotionInfo[] = []

    protected unRenderedNumber = 0

    protected isFull = false

    get MotionInfoList (){
        return this.motionInfoList
    }

    get IsFull () {
        return this.isFull
    }

    getStartIndex() {
        return this.isFull ? this.motionInfoList.length - this.unRenderedNumber : 0
    }

    push(motionInfo: MotionInfo) {
        this.motionInfoList.push(motionInfo)
        this.unRenderedNumber++
        if (this.motionInfoList.length > this.MAX) {
            this.motionInfoList.shift()
            this.isFull = true
            /**
             * 当填满最大值后，重写PUSH方法.
             */
            this.push = (motionInfo: MotionInfo) => {
                this.motionInfoList.shift()
                this.motionInfoList.push(motionInfo)
                this.unRenderedNumber++
            }
        }
    }

    reset() {
        this.unRenderedNumber = 0;
    }
}


class ResultRenderItem {

    protected context:CanvasRenderingContext2D

    protected tempCanvas = window.document.createElement('canvas')

    protected tempContext = this.tempCanvas.getContext('2d')

    protected colors = {
        x: 'rgba(255,0,0,0.5)',
        y: 'rgba(0,255,0,0.5)',
        z: 'rgba(0,0,255,0.5)',
    }
    
    constructor(
        public canvas: HTMLCanvasElement, 
        protected maxValue: number,
        protected width: number,
        protected height: number,
    ) { 
        this.tempCanvas.width = canvas.width = width
        this.tempCanvas.height = canvas.height = height
        const cxt = canvas.getContext('2d')
        if(cxt){
            this.context = cxt
        }else{
            throw new Error('init context2d failed !')
        }
    }

    protected renderOne(motionInfoList: MotionInfo[], axio:'x'|'y'|'z' , stratIndex: number, rate: number){
       
        this.context.fillStyle = this.colors[axio]

        this.context.beginPath()

        for( let index = stratIndex; index< motionInfoList.length; index++){
          const value = motionInfoList[index].data[axio]
          const h = value * rate
          this.context.rect(index, 0.5*this.height -h , 1, h)
        }
        this.context.closePath()
        this.context.fill()
    }

    render(motionInfoList: MotionInfo[], startIndex: number, isFull: boolean){
      
        if(this.tempContext){
            this.tempContext.clearRect(0,0, this.width, this.height)
            this.tempContext.drawImage(this.canvas, isFull?  this.width - startIndex: 0, 0, this.width, this.height, 0, 0, this.width, this.height)
        }
        this.context.clearRect(0,0,this.width, this.height)
        this.context.drawImage(this.tempCanvas, 0, 0)
        const rate = this.height/this.maxValue
        this.renderOne(motionInfoList, 'x', startIndex,rate)
        this.renderOne(motionInfoList, 'y', startIndex,rate)
        this.renderOne(motionInfoList, 'z', startIndex,rate)
    }
    


}

export default class ResultRender {

    private dataMap = new Map<MotionTypes, ResultRenerData>()

    private renderMap = new Map<MotionTypes, ResultRenderItem>()

    constructor(protected dataLength: number) { }

    setRender(type: MotionTypes, canvas: HTMLCanvasElement|null, maxValue: number, height: number) {
        // TODO deal when remove canvas.
        const resultRenderItem =  this.renderMap.get(type)
        if(canvas && !resultRenderItem){
            this.dataMap.set(type, new ResultRenerData(this.dataLength))
            this.renderMap.set(type, new ResultRenderItem(canvas, maxValue, this.dataLength,  height))
        }
    }

    render(type: MotionTypes) {
        const resulteData = this.dataMap.get(type)
        const render = this.renderMap.get(type)
        if(resulteData && render){
            render.render( resulteData.MotionInfoList, resulteData.getStartIndex(), resulteData.IsFull)
            resulteData.reset()
        }
        
    }

    push(motionInfo: MotionInfo) {
        const resultRenerData = this.dataMap.get(motionInfo.type)
        if (resultRenerData) {
            resultRenerData.push(motionInfo)
        }
    }
}