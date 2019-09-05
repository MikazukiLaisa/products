import React from 'react';
import logo from './logo.svg';
import './App.css';
import { bindExpression, tsExpressionWithTypeArguments } from '@babel/types';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.MainPageChange = this.MainPageChange.bind(this)
    this.state = { mainpage: <Products />, pageinfo: "成果物一覧" }
  }

  //引数とstateの名前を一致させると楽に書ける
  MainPageChange(page, info) {
    this.setState({ mainpage: page, pageinfo: info })
  }

  render() {
    document.title = "Mikazukiの里"
    return (
      <div className="mainpage">
        <div className="header">
          <p>DENX 成果物発表会</p>
        </div>
        <div className="menu">
          <Menu MainPageChange={this.MainPageChange} />
        </div>
        <div className="pageinfo">
          <p>{this.state.pageinfo}</p>
        </div>
        <div className="main">
          {this.state.mainpage}
        </div>
        <div className="footer">
          <p>Mikazuki Laisa 2019 All right reserverd. </p>
        </div>
      </div>
    );
  }
}

function Menu(props) {

  function LoadProductsPage() {
    props.MainPageChange(<Products />, "成果物一覧");
  }
  function LoadUploaderPage() {
    props.MainPageChange(<Uploader />, "あっぷろーだー");
  }


  return (
    <div>
      <h3>menu</h3>
      <button onClick={LoadProductsPage}>Home</button><br />
      <button onClick={LoadProductsPage}>info</button><br />
      <button onClick={LoadProductsPage}>products</button><br />
      <button onClick={LoadUploaderPage}>uploader</button>
    </div>
  )
}

class Products extends React.Component {
  constructor(props) {
    super(props)
    //bindとstateはbindを先に書かないとバグる
    this.LoadMainPage = this.LoadMainPage.bind(this);
    this.state = { mainpage: "", id: "", list: [], json: "" }
  }

  //ページをロードするときだけ呼ばれる
  componentDidMount() {
    this.setState({list:[]})
    //corsで怒られているが、server.jsでjsonを返すようにすればいける。
    fetch('https://laisa.info/api/data', {
    //fetch('http://localhost:3020/data', {
      mode: "cors",
      method: "GET",
      json: true
    })
      .then(res => res.json())
      .then(res => {
        this.setState({ json: res })
        console.log(res.contents[0].title);
        //jsonのstateの更新がうまくいってない気がする。
        //再レンダリングされるまでstateは更新されない。
        for (var i in res.contents) {
          this.state.list.push(
          <Contents key={i}
            title={res.contents[i].title}
            imgpath={res.contents[i].imgpath}
            mainpage={res.contents[i].page}
            LoadMainPage={this.LoadMainPage}
            id={i}
            json={res} />);
        }
        this.setState({ mainpage: this.state.list })
      })
  }

  LoadMainPage(id) {
    console.log("update mainpage")
    if (id == null) {
      this.setState({ mainpage: this.state.list })
    } else {
      this.setState({ mainpage: <ProductPage id={id} LoadMainPage={this.LoadMainPage} json={this.state.json} /> });
    }
  }

  render() {
    return (
      <div className="viewer">
        {this.state.mainpage}
      </div>
    );
  }
}

class Contents extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.LoadMainPage(this.props.id);
    e.preventDefault();
  }
  render() {
    var id = this.props.id;
    return (
      <button onClick={this.handleClick} className="contents">
        <img src={this.props.json.contents[id].imgpath} />
        <p>{this.props.title}</p>
      </button>
    )
  }
}

class ProductPage extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    var id = this.props.id;
    var str = this.props.json.contents[id].info;
    var str2 = str.replace(/\r?\n/g, '<br />');
    var div = document.createElement('div');
    var info = document.getElementById("info");
    div.innerHTML = str2;
    info.appendChild(div)

    if(this.props.json.contents[id].moviepath){
      var div_movie = document.createElement("div_movie");
      var movie = document.getElementById("movie");
      var str3 = this.props.json.contents[id].moviepath
      var str4 = str3.replace(/\"\"/g, '\"')
      div_movie.innerHTML = str4;
      movie.appendChild(div_movie)
    }
  }

  render() {
    var id = this.props.id;
    return (
      <div className="product-page">
        <BackButton text="ホームに戻る" LoadMainPage={this.props.LoadMainPage} />
        <h1>作品名：{this.props.json.contents[id].title}</h1>
        <img src={this.props.json.contents[id].imgpath} />
        <div id="movie" />
        <p>作成者：{this.props.json.contents[id].name}</p>
        <hr />
        <div id="info"></div>
      </div>
    )
  }
}

class BackButton extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(e) {
    this.props.LoadMainPage();
    e.preventDefault();
  }

  render() {
    return (
      <div>
        <button value={this.props.text} onClick={this.handleClick}>
          <p>{this.props.text}</p>
        </button>
      </div>

    );
  }
}

class Uploader extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  onClicked() {
    let formData = {
      "name": document.getElementById("name").value,
      "title": document.getElementById("title").value,
      "imgpath": document.getElementById("imgurl").value,
      "moviepath":(document.getElementById("movieurl").value).replace(/\"/g, '\"\"'),
      "info": document.getElementById("info").value
    }
    console.log("name is " + formData.name)
    fetch('https://laisa.info/api/data', {
    //fetch('http://localhost:3020/data', {
      mode: "cors",
      method: "POST",
      body: JSON.stringify(formData),
      headers: {
        "Content-type": "application/json",
      }
    })
      .then(alert("送信完了しました"))
  }

  render() {
    return (
      <form className="uploader">
        <p>動画はあってもなくても可能</p>
        名前：<input type="text" name="name" id="name" required/><br />
        作品名：<input type="text" name="title" id="title" required/><br />
        画像URL：<input type="url" name="url" id="imgurl" /><br />
        動画URL：<input type="url" name="url" id="movieurl" /><br />
        説明：<textarea name="info" id="info" /><br />
        <button onClick={this.onClicked}>送信</button>
      </form>
    )
  }
}


export default App;
