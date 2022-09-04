import type { NextPage } from "next";
import Head from "next/head";
import { ReactElement, useEffect, useState } from "react";
import { Text, Card, Image, Badge } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import { XMLParser } from "fast-xml-parser";
import { v4 as uuidv4 } from "uuid";
import Clock from "react-live-clock";

function getNewsData(newsData: string): ReactElement {
  const parser = new XMLParser();
  const output = parser.parse(newsData);

  return (
    <>
      {output.rss.channel.item.map((item: any) => {
        const time: RegExp | any = item.pubDate.match(/\d\d:\d\d/);
        return (
          <li key={item.pubDate}>
            <span>{time[0]}</span>
            {item.title}
          </li>
        );
      })}
    </>
  );
}
type WeatherGeneral = {
  forecastPeriod: string;
  forecastDesc: string;
};
const getWeatherGeneralData = (weatherData: WeatherGeneral): ReactElement => {
  return (
    <>
      <div className="weather-forecast-group">
        <Text className="forecastPeriod">{weatherData.forecastPeriod}</Text>
        <Text className="forecastDesc">{weatherData.forecastDesc}</Text>
      </div>
    </>
  );
};

type Weather = {
  updateTime: string;
  warningMessage: string[];
  specialWxTips?: string[];
  temperature: {
    data: {
      place: string;
      value: number;
    }[];
  };
  rainfall: {
    data: {
      place: string;
      max?: number;
    }[];
  };
  icon: number[];
};
const getWeatherData = (weatherData: Weather | null): ReactElement => {
  if (weatherData === null)
    return (
      <Text h1 className="section-title">
        天氣狀況： 載入中...
      </Text>
    );

  const updateTime: RegExpMatchArray | null =
    weatherData.updateTime.match(/\d\d:\d\d/);
  let areaName: string = "錯誤！";
  let rainfall: string = "錯誤！";
  let tempDegree: number | null = null;

  if (
    weatherData.temperature.data[23].place ==
    weatherData.rainfall.data[14].place
  ) {
    areaName = weatherData.temperature.data[23].place;
    tempDegree = weatherData.temperature.data[23].value;
  }

  const rMax = weatherData.rainfall.data[14].max;
  rainfall =
    rMax === undefined
      ? "錯誤！"
      : rMax === 0
      ? "沒有下雨"
      : rMax > 30
      ? "大雨"
      : rMax > 5
      ? "有雨"
      : "好似有D雨";

  return (
    <>
      <Text h1 className="section-title">
        天氣狀況：
        <span className="updateTime">{updateTime} 更新</span>
      </Text>
      <div className="weather-warning-group">
        {weatherData.warningMessage[0] !== "" &&
          weatherData.warningMessage.map((msg) => {
            return (
              <Badge
                key={uuidv4()}
                className="warningMessage"
                color="error"
                size="xl"
              >
                {msg}
              </Badge>
            );
          })}
        {weatherData.specialWxTips &&
          weatherData.specialWxTips.map((msg) => {
            return (
              <Badge
                key={uuidv4()}
                className="warningMessage"
                color="error"
                size="xl"
              >
                {msg}
              </Badge>
            );
          })}
      </div>
      <div className="weather-local-group">
        {weatherData.icon.map((iconNum) => {
          return (
            <div key={uuidv4()} className="weather-icon">
              <Image
                src={`https://www.hko.gov.hk/images/HKOWxIconOutline/pic${iconNum}.png`}
                objectFit="contain"
                alt="weather icon"
              />
            </div>
          );
        })}
        <div className="weather-local-info-group">
          <Text className="area">{areaName}</Text>
          <Text className="temperature">
            氣溫：{tempDegree ? tempDegree : "錯誤！"}°C
          </Text>
          <Text className="rainfall">{rainfall}</Text>
        </div>
      </div>
    </>
  );
};

type BusRoute = {
  route: string;
  eta: Date;
  eta_seq: number;
};
type BusStop = {
  data: BusRoute[];
};

const getBusStopData = (
  busStopData: BusStop,
  routes: string[]
): ReactElement => {
  const filteredRoutes: Array<any> = [];
  routes.map((routeNumber) => {
    let _ = busStopData.data.filter((data) => data.route == routeNumber);
    Object.defineProperty(filteredRoutes, routeNumber, {
      value: _,
    });
  });

  return (
    <>
      {routes.map((routeNumber: any) => {
        return (
          <div key={uuidv4()} className="route">
            <Text className="route-number">{routeNumber}</Text>

            {filteredRoutes[routeNumber].map((el: any) => {
              let ms = new Date(el.eta).getTime() - new Date().getTime();
              let minArrive = ms / 1000 / 60;

              //console.log(el.eta, ms / 1000 / 60);
              if (minArrive > 0) {
                return (
                  <Card key={uuidv4()} className="route-eta" variant="bordered">
                    <Card.Body>
                      <Text
                        className={
                          minArrive > 10 ? "route-eta-3" : "route-eta-1"
                        }
                      >
                        <span>
                          {minArrive < 1.5 ? "即將到達" : Math.floor(minArrive)}
                        </span>
                        {minArrive > 1.5 &&
                          ` 分鐘 (${el.eta.match(/\d\d:\d\d/)})`}
                      </Text>
                    </Card.Body>
                  </Card>
                );
              }
            })}
          </div>
        );
      })}
    </>
  );
};

const Dashboard: NextPage = () => {
  const [time, setTime] = useState<ReactElement | null>(null);
  const [date, setDate] = useState<ReactElement | null>(null);

  useEffect(() => {
    setTime(() => {
      return (
        <Clock
          className="time"
          format={"HH:mm:ss"}
          ticking={true}
          timezone={"Asia/Hong_Kong"}
        />
      );
    });
    setDate(function () {
      return (
        <Clock
          className="date"
          format={"YYYY年MM月DD日（）"}
          timezone={"Asia/Hong_Kong"}
        />
      );
    });
  }, []);
  useEffect(() => {
    const dayOfWeek = new Date().toLocaleString("zh-HK", {
      weekday: "narrow",
      timeZone: "Asia/Hong_Kong",
    });
    const text = document.querySelector(
      ".datetime-container .date"
    ) as HTMLElement | null;

    if (text)
      text.innerText = text.innerText.replace(/（）/, `（${dayOfWeek}）`);
  }, [date]);

  const newsQuery = useQuery(
    ["newsData"],
    () =>
      fetch(
        "https://rthk9.rthk.hk/rthk/news/rss/c_expressnews_clocal.xml"
      ).then((res) => res.text()),
    {
      refetchIntervalInBackground: true,
      refetchInterval: 1000 * 60 * 3,
    }
  );
  const weatherGeneralQuery = useQuery(
    ["weatherGeneralData"],
    () =>
      fetch(
        "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=flw&lang=tc"
      ).then((res) => res.json()),
    {
      refetchIntervalInBackground: true,
      refetchInterval: 1000 * 60 * 10,
    }
  );
  const weatherQuery = useQuery(
    ["weatherData"],
    () =>
      fetch(
        "https://data.weather.gov.hk/weatherAPI/opendata/weather.php?dataType=rhrread&lang=tc"
      ).then((res) => res.json()),
    {
      refetchIntervalInBackground: true,
      refetchInterval: 1000 * 60 * 10,
    }
  );
  const busStopQuery = useQuery(
    ["busStopData"],
    () =>
      fetch(
        "https://data.etabus.gov.hk/v1/transport/kmb/stop-eta/6A6E44D4207221C1"
      ).then((res) => res.json()),
    {
      refetchIntervalInBackground: true,
      refetchInterval: 1000 * 10,
    }
  );

  return (
    <>
      <Head>
        <title>Morning Dashboard</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <div className="main-container">
        <section className="top-left">
          <div className="datetime-container">
            {date}
            {time}
          </div>
        </section>

        <section className="bottom-left">
          <div className="weather-container">
            {weatherQuery.isLoading
              ? ""
              : weatherQuery.isError
              ? "錯誤！"
              : weatherQuery.data
              ? getWeatherData(weatherQuery.data)
              : null}
            {weatherGeneralQuery.isLoading
              ? ""
              : weatherGeneralQuery.isError
              ? "錯誤！"
              : weatherGeneralQuery.data
              ? getWeatherGeneralData(weatherGeneralQuery.data)
              : null}
          </div>
        </section>
        <section className="top-right">
          <div className="news-container">
            <Text h1 className="section-title">
              即時新聞：
            </Text>
            {newsQuery.isLoading
              ? "Loading..."
              : newsQuery.isError
              ? "Error!"
              : newsQuery.data
              ? getNewsData(newsQuery.data)
              : null}
          </div>
        </section>
        <section className="bottom-right">
          <div className="bus-status-container">
            <Text h1 className="section-title">
              下一班車：<span className="route-stop-name">深水埗桂林街</span>
            </Text>
            <div className="bus-routes">
              {busStopQuery.isLoading
                ? "Loading..."
                : busStopQuery.isError
                ? "Error!"
                : busStopQuery.data
                ? getBusStopData(busStopQuery.data, ["2", "2A"])
                : null}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
