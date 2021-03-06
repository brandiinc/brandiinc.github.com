---
title: 개발자의 시간 벌기
layout: post
cover: "/assets/default.jpg"
author: chunbs
subtitle: 손해보지 않는 개발자 업무 프로그램 만들기
---

# Overview
지루한 작업은 저와 어울리지 않습니다. 한마디로 귀차니즘이 가득한 개발자입니다. 반복적인 일을 하고 있으면 딴 생각이 많이 떠오릅니다. 특히 개발 과정은 쿼리를 작성하고, 프로그램에 적용하고, 검증하는 일이 자주 발생하는데 필요 이상으로 내 시간을 낭비한다는 생각이 들었습니다. 매번 다시 작업해야 하는 쿼리의 조합을 책상 서랍에 착착! 정리해둔 물건처럼, 코드도 언제든 쓸 수 있게 착착! 준비해두면 시간도 절약되고, 업무도 편리해지지 않을까요. <br><br>

{% include figure.html file="/assets/easydebug/1.png" alt="SQL코드 더미" caption="도대체 최종 결과는....? " width="100" border="#ccc" %}


개발언어를 PHP로 전향하면서 제일 오래 걸리는 부분은 프로그램에서 발생하는 쿼리를 다시 조합하고, 검증하는 작업이었습니다. 프로그램에 사용하는 조건을 체크하고, 대입되는 변수들을 체크하고, 치환할 부분에 넣어주는 작업을 반복해야 하고, 야근하고, 건강 잃고... 쿼리가 정상적으로 조합되지 않으면 어느 부분이 틀렸는지 매번 확인해야 합니다. 이 번거로운 작업을 안드로이드 개발에서 사용하는 logcat 같은 기능으로 만들면 좋을 것 같았습니다. 그래서 PHP용 Log 프로그램을 간단하게 만들기 시작했습니다. <br><br>

{% include figure.html file="/assets/easydebug/2.png" alt="logcat" caption="Logcat 화면, 한결 보기 편해 보인다. ㅂㄹ" %}<br><br>

### 개발 컨셉
{% include figure.html file="/assets/easydebug/3.jpeg" alt="개발 컨셉" caption="손으로 쓱쓱 그려 보았습니다." border="true" %}
<br><br>

### PHP 쿼리 요청 코드
```PHP
//  sql 디버깅 코드: 쿼리 시작
if (ENVIRONMENT == 'testing') {
    if(function_exists('localDebugger')) localDebugger( 'sql_start', "0,".$sql);
}

// Run the  Query
if (FALSE === ($this->result_id = $this->simple_query($sql)))
{
    // 소스 생략
    if ($this->db_debug)
     {
             // 소스생략 ...
           $this->trans_complete();
             // sql 디버깅 코드: 쿼리 에러
          if (ENVIRONMENT == 'testing') {
              if(function_exists('localDebugger'))  localDebugger( 'sql_error', '0, -- Error  Number: '.$error_no  ."\n--  message: ".$error_msg."\n");
          }
             // 소스생략 ...
     }
    return FALSE;
}
// 소스 생략
//  sql 디버깅 코드: 쿼리 종료
if (ENVIRONMENT == 'testing') {
    if(function_exists('localDebugger')) localDebugger( 'sql_done', ($em + $es) - ($sm + $ss).",");
}
```

<br><br>
### PHP 디버그 서버에 요청 코드
```PHP
$callNo = time();

         /**
          *로컬서버에 디버깅 메세지
          * 지정된 서버에 디버깅 메세지 전달
          * @access public
          * @author BoseungChun <chunbs@brandi.co.kr>
          * @param string $message   디버깅할 메세지
          */

    function localDebugger( $type, $message ) {
          global $callNo;
          //debugger server
          $url = 'http://127.0.0.1:3000';
          $ch= curl_init($url);

          // 요청 파일 분석
          $trace= debug_backtrace();
          $fileName= substr( $trace[1]['file'],strrpos($trace[1]['file'], '/') );
          $line= $trace[1]['line'];
          $fileName2= substr( $trace[2]['file'], strrpos($trace[2]['file'], '/'));
          $line2= $trace[2]['line'];

           // POST로 로깅 서버에 메세지 전달 
          curl_setopt($ch, CURLOPT_POST, 1);
          curl_setopt($ch, CURLOPT_POSTFIELDS, $callNo.' '.$type.' '.uri_string().' '.$fileName2.':'.$line2."\n".$fileName.':'.$line.' '.$message);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $response = curl_exec($ch);
          curl_close($ch);
    }
```

<br><br>
### nodejs 일부 코드 ###
```javascript
 // 서버 기동
  const http = require('http');
  const hostname = '127.0.0.1';
  const port = 3000;
  const server = http.createServer((req, res) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/plain');
      var body = '';
      req.on('data', function (chunk) {
          body += chunk;
      }).on('end', function () {
          var pos = body.indexOf(' ');
          var no = body.substring(0, pos);
          body = body.substring(pos+1);
          pos = body.indexOf(' ');
          var type = body.substring(0, pos);
          body = body.substring(pos+1);
          pos = body.indexOf(' ');
          var uri = body.substring(0, pos);
          body = body.substring(pos+1);
          pos = body.indexOf(' ');
          var file = body.substring(0, pos);
          body = body.substring(pos+1);
          pos = body.indexOf(',');
          addSqlBlock( no, uri, file, body.substring(pos+1), body.substring(0, pos), type );
     })
     res.end('');
  });
  server.listen(port, hostname, () => {
      console.log('Server running at http://${hostname}:${port}/');
  });

  // 코드 생략
  function addSqlBlock( no, uri, file, sql, ms, type ) {
     // UI를 구성해서 코드 블럭를 관리하는 태그에 붙여준다.
  }
```

코드는 위의 코드와 같이 간단한 것들을 사용했습니다. 아래의 이미지는 nodejs를 이용해서 디버깅 메시지를 받을 서버를 만들고, 포트를 열어둔 것입니다. 정리하면 PHP 코드에서 발생하는 쿼리의 최종 내용을 디버깅 서버에 HTTP post 방식으로 전달해주는 구조입니다. 코드는 몇 줄 안 되지만, 꽤나 강력한 도구가 만들어졌습니다.
<br><br><br>


{% include figure.html file="/assets/easydebug/4.jpeg" alt="전설의 밥 아저씨" caption=" \"어때요. 참 쉽죠?\"" width="50" %}<br><br>
{% include figure.html file="/assets/easydebug/5.png" alt="로거의 베타 버전" caption="짜란~~~ Logger 베타 버전" %}


이 도구는 페이지를 요청하는 즉시 쿼리가 잡힙니다. 어떤 페이지 요청에서 어떤 쿼리가 발생하는지 쉽게 분석할 수 있으니 번거롭게 쿼리를 조합하는 과정은 자연스럽게 사라졌습니다. <br><br>

{% include figure.html file="/assets/easydebug/6.png" alt="로거의 버전업" caption=" 색상으로 쿼리의 속도를 표현했다." %}

이 프로그램의 제작자이지만, 유일한 사용자이기도 합니다. 불편한 게 느껴지면 바로 수정해야 했습니다. 어렸을 때 학습지 좀 풀었던 실력으로 <font color="red">알아서 척척척 스스로</font> 기능을 보강했습니다. 위의 이미지처럼 색상만 추가해도 쉽게 분별할 수 있습니다. 쿼리 실행시간을 추가해 어떤 쿼리가 병목을 잡는지도 빠르게 찾을 수 있습니다.<br><br>

{% include figure.html file="/assets/easydebug/7.png" alt="로거의 버전업" caption=" PHP 요청 패스를 넣었더니 개 이득!" %}


디버깅에 유용한 정보까지 추가했습니다. 요청된 경로, 쿼리가 실행된 파일의 이름, 라인 위치 모델을 요청한 상위 파일의 이름과 라인 위치를 추가해 트래킹을 보강했습니다. 이쯤 되니 거의 절대반지급입니다. 쿼리 이즈 마이 프레셔스..<br><br>

{% include figure.html file="/assets/easydebug/8.png" alt="로거의 버전업" caption=" 개발에 필요한 정보들이 노출되니 기쁘지 아니한가!" %}

<br>
이외에도 현재까지 아래의 기능들을 추가했습니다.
- 쿼리 카피 기능과 신텍스 하이라이트, 쿼리 라인
- 쿼리 에러 메시지 로깅
- url 요청 단위로 쿼리 묶어주기
- 시간이 지난 쿼리 자동 지우기
- 키워드 검색 기능


필요한 걸 직접 만들어 사용하는 것이 귀찮을지도 모릅니다. D.I.Y도 아닌데 말입니다. 하지만 자신의 개발 능력을 활용해 업무 환경을 개선하고, 개선된 만큼의 시간을 다시 투자해 선순환 구조를 만든다면 행복한(?) 개발이 될 거라 생각합니다. (=더 많은 일을 하게 되는 건 안 비밀) 



오늘은 업무 전, 반복 작업을 개선하면 어떨까요.
<br>


<b>참고(사용기술)</b>
- nwjs
- PHP (codeigniter)
- CSS3 + HTML5
- JQuery