import { useState, useCallback } from "react";
import { Tweet } from "react-twitter-widgets";
import axios from "axios";
import sampleSize from "lodash.samplesize";
import { Space, Input, InputNumber, Row, Col, Spin } from "antd";
const MainComponent = () => {
  const [replies, setReplies] = useState<any[]>([]);
  const [query, setQuery] = useState(
    "https://twitter.com/JJGD/status/1510310437421654018"
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [picked, setPicked] = useState<any[]>([]);
  const [randomAmount, setRandomAmount] = useState<number>(10);
  const [displayTweets, setDisplayTweets] = useState<any[]>([]);

  const setRandomPicked = useCallback(
    (replies: any[], picked: any[]) => {
      setDisplayTweets([]);
      const restReplies = replies.filter(
        (item) => !picked.find((pick) => pick.id === item.id)
      );
      const innerPicked: any[] = sampleSize(restReplies, randomAmount);
      setPicked((old: any[]) => [...old, ...innerPicked]);

      innerPicked.forEach((pick: any) => {
        axios(`/api/random?id=${pick.id}`).then((res) => {
          if (res && res.data.code === 200) {
            setDisplayTweets((old) => old.concat(res.data.result));
          }
        });
      });
    },
    [randomAmount]
  );

  const randomPick = useCallback(() => {
    if (!query || loading) return;
    if (!replies.length) {
      setLoading(true);
      return axios(`/api/all-replies?url=${query}`)
        .then((res) => {
          if (res && res.data.code === 200) {
            const randomDatas = res.data?.result;
            randomDatas?.sort(() => Math.random() - 0.5);
            setReplies(randomDatas);
            setRandomPicked(randomDatas, picked);
          }
        })
        .finally(() => {
          setLoading(false);
        })
        .catch((err) => {});
    } else {
      setRandomPicked(replies, picked);
    }
  }, [loading, picked, query, replies, setRandomPicked]);

  const inputQuery = (e: any) => {
    setQuery(e.target.value);
  };

  return (
    <div
      style={{
        padding: "0 50px",
      }}
    >
      <Space align="baseline">
        <h3>推特地址</h3>
        <Input.Search
          value={query}
          placeholder="推特地址"
          onChange={inputQuery}
          onSearch={randomPick}
          enterButton="点击开始抽取"
          style={{ paddingBottom: "20px", width: "600px" }}
        />
        <h3>每次抽取数量</h3>
        <InputNumber
          placeholder="每次抽取数量"
          value={randomAmount}
          onChange={(value) => {
            if (Number(value)) {
              setRandomAmount(Math.floor(value));
            } else {
              setRandomAmount(0);
            }
          }}
        />
        <a
          href="https://github.com/yzStrive/tw-replay-random-picker"
          target="_blank"
          rel="noreferrer"
        >
          代码开源地址
        </a>
      </Space>
      {/* @ts-ignore */}
      <Spin spinning={loading}>
        <h1>中奖者名单，已抽取数量({picked.length})</h1>
        <Row gutter={20}>
          {displayTweets.map((item) => {
            return (
              <Col key={item.id_str}>
                {/* @ts-ignore */}
                <Spin spinning={loading}>
                  <Tweet
                    onLoad={() => {
                      setLoading(true);
                      setTimeout(() => {
                        setLoading(false);
                      }, 3000);
                    }}
                    tweetId={item.id_str}
                    options={{
                      align: "center",
                      theme: "light",
                    }}
                  />
                </Spin>
              </Col>
            );
          })}
        </Row>
      </Spin>
    </div>
  );
};

export default MainComponent;
