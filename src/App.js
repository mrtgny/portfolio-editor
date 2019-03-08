import React, { Component } from 'react';
import './App.css';

class App extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = { element: [], maxZindex: 2 }
    this.fileLoad = this.fileLoad.bind(this)
  }

  fileLoad(e2) {
    for (let i = 0; i < e2.target.files.length; i++) {
      var reader = new FileReader();
      const file = e2.target.files[i];
      reader.readAsDataURL(file);
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          this.setState({
            element: [...this.state.element, { data: e.target.result, initialImage: img }]
          })
        }
        img.src = e.target.result
      }
    }

  }

  render() {
    return (
      <div className="container" id="container" onDragOver={e => e.target.className != "element" && e.preventDefault()}>
        <div style={{ width: "100%", height: "100%" }}> <input id="fileinput" type="file" onChange={this.fileLoad} multiple={true} /></div>
        {this.state.element.map((element) => <Elemenet element={element} key={element.data} incMaxZindex={() => this.setState({ maxZindex: this.state.maxZindex + 1 })} maxZindex={this.state.maxZindex} />)}
      </div>
    );
  }
}


class Elemenet extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.state = { hover: 0 }
    this.onDrag = this.onDrag.bind(this)
    this.onMouseMove = this.onMouseMove.bind(this)
    this.moveAt = this.moveAt.bind(this)
    this.onElementResize = this.onElementResize.bind(this)
    this.onMouseResize = this.onMouseResize.bind(this)
    this.getPosition = this.getPosition.bind(this)
    this.onContextMenu = this.onContextMenu.bind(this)
    this.resetResize = this.resetResize.bind(this)
    this.clipMaskInt = this.clipMaskInt.bind(this)
    this.bringFronter = this.bringFronter.bind(this)
    this.bringFrontest = this.bringFrontest.bind(this)
    this.sendBacker = this.sendBacker.bind(this)
    this.sendBackest = this.sendBackest.bind(this)
    this.onClipperDrag = this.onClipperDrag.bind(this)
  }

  bringFronter() {
    console.log("element", this.element.style.zIndex)
    this.element.parentElement.style.zIndex = parseInt(this.element.parentElement.style.zIndex || "0") + 1
    this.setState({ openMenu: false })
  }

  bringFrontest() {
    this.element.parentElement.style.zIndex = this.props.maxZindex
    this.props.incMaxZindex()
    this.setState({ openMenu: false })
  }

  sendBacker() {
    console.log("element", this.element.style.zIndex)
    this.element.parentElement.style.zIndex = parseInt(this.element.parentElement.style.zIndex || "2") || 2 - 1
    this.setState({ openMenu: false })
  }

  sendBackest() {
    this.element.parentElement.style.zIndex = 1
    this.setState({ openMenu: false })
  }


  resetResize() {
    const { element: { initialImage } } = this.props
    const rate = initialImage.height / initialImage.width;
    const rect = this.element.getBoundingClientRect();;
    this.element.style.height = rect.width * rate + "px"
    this.setState({ openMenu: false })
  }

  onMouseMove(event) {
    this.moveAt(event.pageX, event.pageY);
  }

  moveAt(pageX, pageY) {
    const element = this.state.element
    element.style.left = this.clipMaskInt(0, pageX - this.state.offsetX) + 'px';
    element.style.top = this.clipMaskInt(20, pageY - this.state.offsetY) + 'px';
    this.setState({ element })
  }

  onDrag(event) {
    event.persist()
    const element = event.target.parentElement;
    const rect = element.getBoundingClientRect();
    const offsetX = event.pageX - rect.left;
    const offsetY = event.pageY - rect.top;
    const initzIndex = element.style.zIndex
    this.setState({ element, offsetX, offsetY }, () => {
      const { element } = this.state
      element.style.position = 'absolute';
      element.style.zIndex = this.props.maxZindex;
      document.addEventListener('mousemove', this.onMouseMove);
      element.onmouseup = () => {
        element.style.zIndex = initzIndex
        document.removeEventListener('mousemove', this.onMouseMove);
        element.onmouseup = null;
      };
    })
  };

  clipMaskInt(min, number, max) {
    if (min == undefined && max == undefined) {
      return number
    }
    else if (max != undefined && number > max) {
      return max
    }
    else if (min != undefined && number < min) {
      return min
    }
    return number
  }

  onMouseResize(e, event, resizeType) {
    const parentElement = event.target.parentElement;
    const element = parentElement.children[0];
    const rects = element.getBoundingClientRect();
    let diff = 0;
    switch (resizeType) {
      case "t":
        diff = rects.top - e.pageY;
        element.style.height = rects.height + diff + "px"
        parentElement.style.top = this.clipMaskInt(20, e.pageY) + "px"
        break;
      case "r":
        element.style.width = e.pageX - rects.left + "px"
        break;
      case "b":
        element.style.height = (e.pageY - rects.top) + "px"
        break;
      case "l":
        element.style.width = (rects.width - (e.pageX - rects.left)) + "px"
        parentElement.style.left = this.clipMaskInt(0, e.pageX) + "px"
        break;
      case "tl":
        diff = (e.pageX - rects.left)
        element.style.width = (rects.width - diff) + "px"
        element.style.height = (rects.height - diff) + "px"
        parentElement.style.left = this.clipMaskInt(0, rects.left + diff) + "px"
        parentElement.style.top = this.clipMaskInt(20, rects.top + diff) + "px"
        break;
      case "tr":
        diff = (e.pageX - rects.left - rects.width)
        element.style.width = (rects.width + diff) + "px"
        element.style.height = (rects.height + diff) + "px"
        parentElement.style.top = this.clipMaskInt(20, rects.top - diff) + "px"
        break;
      case "br":
        diff = (e.pageX - rects.left - rects.width)
        element.style.width = (rects.width + diff) + "px"
        element.style.height = (rects.height + diff) + "px"
        break;
      case "bl":
        diff = (e.pageX - rects.left)
        element.style.width = (rects.width - diff) + "px"
        element.style.height = rects.height - diff + "px"
        parentElement.style.left = this.clipMaskInt(0, (rects.left + rects.width > e.pageX ? e.pageX : rects.left)) + "px"
        break;
      default:
        break;
    }
    this.setState({ element, parentElement })
  }

  onElementResize(event, resizeType) {
    event.persist();
    const onMouseResize = e => this.onMouseResize(e, event, resizeType)
    document.addEventListener('mousemove', onMouseResize);
    document.onmouseup = () => {
      document.removeEventListener('mousemove', onMouseResize);
      event.target.onmouseup = null;
    };
  }

  getPosition(positionType) {
    if (!this.element)
      return {}
    let style = {}
    const rects = this.element.getBoundingClientRect()
    switch (positionType) {
      case "t":
        style = {
          width: "100%",
          height: 2,
          top: rects.top - 2,
          left: 0
        }
        break;
      case "l":
        style = {
          width: 2,
          height: "100%",
          top: 0,
          left: rects.left - 2
        }
        break;
      case "r":
        style = {
          width: 2,
          height: "100%",
          top: 0,
          left: rects.left + rects.width
        }
        break;
      case "b":
        style = {
          width: "100%",
          height: 2,
          top: rects.top + rects.height,
          left: 0
        }
        break;
      default:
        break;
    }
    return style;
  }

  onContextMenu(e) {
    e.preventDefault();
    this.setState({ openMenu: true, left: e.pageX, top: e.pageY })
    return false;
  }

  getWrapperSize() {
    if (!this.wrapper)
      return {}
    const { width, height } = this.wrapper.getBoundingClientRect()
    return { width, height }
  }

  onClipperDrag(e) {
    const rect = e.target.getBoundingClientRect();
    if (Math.abs(rect.left - e.pageX) <= 4) {
      console.log("border left")
    }
    if (Math.abs(rect.top - e.pageY) <= 4) {
      console.log("border top")
    }
  }

  render() {
    const { element: { data } } = this.props
    return (

      <div className="wrap" ref={e => this.wrapper = e} onMouseEnter={() => this.setState({ hover: 1 })} onMouseLeave={() => this.setState({ hover: 0 })} onContextMenu={this.onContextMenu}>

        <img draggable={false} ref={e => this.element = e} onSelect={e => e.preventDefault()} width="300" height="auto" src={data} alt="Foto" className="element" onMouseDown={this.onDrag} />

        <ContextMenu open={this.state.openMenu}
          top={this.state.top}
          left={this.state.left}
          resetResize={this.resetResize}
          bringFronter={this.bringFronter}
          bringFrontest={this.bringFrontest}
          sendBacker={this.sendBacker}
          sendBackest={this.sendBackest}
        />

        <div className="resizer-top-left" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "tl") }}></div>
        <div className="resizer-top-right" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "tr") }}></div>
        <div className="resizer-bottom-left" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "bl") }}></div>
        <div className="resizer-bottom-right" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "br") }}></div>

        <div className="resizer-top" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "t") }}></div>
        <div className="resizer-right" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "r") }}></div>
        <div className="resizer-bottom" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "b") }}></div>
        <div className="resizer-left" style={{ opacity: this.state.hover, transition: "0.4s" }} draggable={false} onMouseDown={e => { this.onElementResize(e, "l") }}></div>

        <div style={{ backgroundColor: "blue", opacity: "0.1", position: "fixed", ...this.getPosition("t") }}></div>
        <div style={{ backgroundColor: "blue", opacity: "0.1", position: "fixed", ...this.getPosition("l") }}></div>
        <div style={{ backgroundColor: "blue", opacity: "0.1", position: "fixed", ...this.getPosition("r") }}></div>
        <div style={{ backgroundColor: "blue", opacity: "0.1", position: "fixed", ...this.getPosition("b") }}></div>
      </div>
    )
  }
}

const ContextMenu = props => {
  const { top, left, resetResize, open, bringFronter, bringFrontest, sendBacker, sendBackest } = props
  if (!open)
    return null;
  return (
    <div style={{ position: "fixed", left, top, backgroundColor: "#ccc", zIndex: 10000 }}>
      <div onClick={resetResize}> Resize </div>
      <div onClick={bringFronter}> Bi Öne Getir </div>
      <div onClick={bringFrontest}> En Öne Getir </div>
      <div onClick={sendBacker}> Bi Geri Götür </div>
      <div onClick={sendBackest}> En Geri Götür </div>
    </div>
  )
}

export default App;
