import { Chart, registerables } from "chart.js";
import annotationPlugin from "chartjs-plugin-annotation";

Chart.register(...registerables, annotationPlugin);

const MAX_DATA = 150;

export default class Stats {
  constructor(dailyInstance) {
    this.daily = dailyInstance;
    this.curThreshold = "good";
    // this.curConnection = "connected";
    this.goodCnt = 0;
    this.lowCnt = 0;
    this.badCnt = 0;
    this.cxCnt = 0;
    this.intCnt = 0;
    this.annotations = {};
    this.initializeCharts();
    this.daily.call.on("joined-meeting", this.setupStatsInterval.bind(this));
    this.daily.call.on("network-quality-change", this.updateQuality.bind(this));
    this.daily.call.on("network-connection", this.updateConnection.bind(this));
    this.daily.call.on("left-meeting", () => {
      clearInterval(this.statsInterval);
    });
  }

  initializeCharts() {
    const bitrateCtx = document.getElementById("bitrateChart");
    const aobCtx = document.getElementById("aobChart");
    const avgCtx = document.getElementById("avgJitterChart");
    const mAvgCtx = document.getElementById("mAvgJitterChart");
    const plCtx = document.getElementById("packetLossChart");
    const qCtx = document.getElementById("qualityChart");
    this.aobVals = [];
    this.avgJitterVals = {
      videoSend: [],
      videoRecv: [],
      audioSend: [],
      audioRecv: [],
    };
    this.packetLossVals = {
      videoSend: [],
      videoRecv: [],
      audioSend: [],
      audioRecv: [],
    };
    let datasets = [
      {
        label: "videoSend",
        data: [],
      },
      {
        label: "videoRecv",
        data: [],
      },
      {
        label: "audioSend",
        data: [],
      },
      {
        label: "audioRecv",
        data: [],
      },
    ];

    this.bitrateChart = new Chart(bitrateCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "videoSend",
            data: [],
          },
          {
            label: "videoRecv",
            data: [],
          },
          {
            label: "audioSend",
            data: [],
          },
          {
            label: "audioRecv",
            data: [],
          },
        ],
      },
      options: {
        plugin: {
          legend: {
            title: "bitrates",
            hidden: false,
          },
        },
        plugins: {
          annotation: {
            annotations: this.annotations,
          },
        },
      },
    });

    this.aobChart = new Chart(aobCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "availableOutgoingBitrate",
            data: [],
          },
          {
            label: "moving avg availableOutgoingBitrate",
            data: [],
          },
        ],
      },
      options: {
        plugin: {
          legend: {
            title: "available outgoing bitrate",
            hidden: false,
          },
        },
        plugins: {
          annotation: {
            annotations: this.annotations,
          },
        },
      },
    });

    this.avgJitterChart = new Chart(avgCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [...datasets],
      },
      options: {
        plugin: {
          legend: {
            title: "average jitter",
            hidden: false,
          },
        },
        plugins: {
          annotation: {
            annotations: this.annotations,
          },
        },
      },
    });

    this.mAvgJitterChart = new Chart(mAvgCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "videoSend",
            data: [],
          },
          {
            label: "videoRecv",
            data: [],
          },
          {
            label: "audioSend",
            data: [],
          },
          {
            label: "audioRecv",
            data: [],
          },
        ],
      },
      options: {
        plugin: {
          legend: {
            title: "moving avg. jitter",
            hidden: false,
          },
        },
        plugins: {
          annotation: {
            annotations: this.annotations,
          },
        },
      },
    });

    this.packetLossChart = new Chart(plCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "videoSend",
            data: [],
          },
          {
            label: "videoRecv",
            data: [],
          },
          {
            label: "audioSend",
            data: [],
          },
          {
            label: "audioRecv",
            data: [],
          },
        ],
      },
      options: {
        plugin: {
          legend: {
            title: "packet loss",
            hidden: false,
          },
        },
        plugins: {
          annotation: {
            annotations: this.annotations,
          },
        },
        scales: {
          y: {
            min: 0.0,
            max: 1.0,
          },
        },
      },
    });

    this.qualityChart = new Chart(qCtx, {
      type: "line",
      data: {
        labels: [],
        datasets: [
          {
            label: "quality",
            data: [],
          },
        ],
      },
      options: {
        plugin: {
          legend: {
            title: "quality score",
            hidden: false,
          },
        },
        plugins: {
          annotation: {
            annotations: this.annotations,
          },
        },
        scales: {
          y: {
            min: 0,
            max: 100,
          },
        },
      },
    });
  }

  setupStatsInterval() {
    this.statsInterval = setInterval(async () => {
      const netStats = await daily.call.getNetworkStats();
      const latestStats = netStats.stats.latest;
      if (!this.statsStartTime) {
        this.statsStartTime = latestStats.timestamp;
        this.localStartTime = Date.now();
      }

      const startTime = this.statsStartTime;
      const timeLabel = (latestStats.timestamp - startTime) / 1000;
      console.log(`${timeLabel}`, netStats);
      this.bitrateChart.data.labels.push(timeLabel);
      if (this.bitrateChart.data.labels.length > MAX_DATA) {
        this.bitrateChart.data.labels.shift();
      }
      this.aobChart.data.labels.push(timeLabel);
      if (this.aobChart.data.labels.length > MAX_DATA) {
        this.aobChart.data.labels.shift();
      }
      this.avgJitterChart.data.labels.push(timeLabel);
      if (this.avgJitterChart.data.labels.length > MAX_DATA) {
        this.avgJitterChart.data.labels.shift();
      }
      this.mAvgJitterChart.data.labels.push(timeLabel);
      if (this.mAvgJitterChart.data.labels.length > MAX_DATA) {
        this.mAvgJitterChart.data.labels.shift();
      }
      this.packetLossChart.data.labels.push(timeLabel);
      if (this.packetLossChart.data.labels.length > MAX_DATA) {
        this.packetLossChart.data.labels.shift();
      }
      this.qualityChart.data.labels.push(timeLabel);
      if (this.qualityChart.data.labels.length > MAX_DATA) {
        this.qualityChart.data.labels.shift();
      }

      let _updateDatasets = (label, bitrate, jitter, pl) => {
        // fill in bitrate chart
        let bitrateData = this.bitrateChart.data.datasets.find(
          (ds) => ds.label === label
        );
        const curRate = bitrate != null ? bitrate : 0;

        bitrateData.data.push(curRate);
        if (bitrateData.length > MAX_DATA) {
          bitrateData.data.shift();
        }

        // fill in avg jitter chart
        let avgJitterData = this.avgJitterChart.data.datasets.find(
          (ds) => ds.label === label
        );
        const avgJitterArray = this.avgJitterVals[label];
        const lastAvg = avgJitterArray[avgJitterArray.length - 1] || 0;
        const curAvg = jitter != null ? jitter : lastAvg;

        avgJitterArray.push(curAvg);
        avgJitterData.data.push(curAvg);
        if (avgJitterArray.length > MAX_DATA) {
          avgJitterArray.shift();
          avgJitterData.data.shift();
        }

        // fill in moving average jitter chart
        let mAvgJitterData = this.mAvgJitterChart.data.datasets.find(
          (ds) => ds.label === label
        );
        let last20 = avgJitterArray.slice(-10);
        const mAvg = last20.reduce((a, f) => a + f) / last20.length;
        mAvgJitterData.data.push(mAvg);
        if (mAvgJitterData.data.length > MAX_DATA) {
          mAvgJitterData.data.shift();
        }

        // fill in packet loss chart
        const packetLossData = this.packetLossChart.data.datasets.find(
          (ds) => ds.label === label
        );
        const packetLossArray = this.packetLossVals[label];
        const lastPL = packetLossArray[packetLossArray.length - 1] || 0;
        const curPL = pl != null ? pl : lastPL;

        packetLossArray.push(curPL);
        packetLossData.data.push(curPL);
        if (packetLossArray.length > MAX_DATA) {
          packetLossArray.shift();
          packetLossData.data.shift();
        }

        console.log(
          `!!! ${label}: { bitrate: ${bitrate}, avg: ${curAvg}, mAvg: ${mAvg}, pl: ${curPL} }`
        );
      };
      _updateDatasets(
        "videoSend",
        latestStats.videoSendBitsPerSecond,
        latestStats.videoSendJitter,
        latestStats.videoSendPacketLoss
      );
      _updateDatasets(
        "videoRecv",
        latestStats.videoRecvBitsPerSecond,
        latestStats.videoRecvJitter,
        latestStats.videoRecvPacketLoss
      );
      _updateDatasets(
        "audioSend",
        latestStats.audioSendBitsPerSecond,
        latestStats.audioSendJitter,
        latestStats.audioSendPacketLoss
      );
      _updateDatasets(
        "audioRecv",
        latestStats.audioRecvBitsPerSecond,
        latestStats.audioRecvJitter,
        latestStats.audioRecvPacketLoss
      );

      // update aob chart
      const aobData = this.aobChart.data.datasets[0];
      const lastAOB = this.lastAOB || 0;
      const curAOB =
        latestStats.availableOutgoingBitrate != null
          ? latestStats.availableOutgoingBitrate
          : lastAOB;
      this.lastAOB = curAOB;

      this.aobVals.push(curAOB);
      aobData.data.push(curAOB);
      if (aobData.data.length > MAX_DATA) {
        aobData.data.shift();
      }
      // fill in moving average for aob
      let mAvgAOBData = this.aobChart.data.datasets[1];
      let last20 = this.aobVals.slice(-10);
      const mAvg = last20.reduce((a, f) => a + f) / last20.length;
      mAvgAOBData.data.push(mAvg);
      if (mAvgAOBData.data.length > MAX_DATA) {
        mAvgAOBData.data.shift();
      }

      // update quality chart
      const qualityData = this.qualityChart.data.datasets[0];
      const lastQ = this.lastQ || 0;
      const curQ = netStats.quality != null ? netStats.quality : lastQ;

      this.lastQ = curQ;
      qualityData.data.push(curQ);
      if (qualityData.data.length > MAX_DATA) {
        qualityData.data.shift();
      }

      this.bitrateChart.update();
      this.aobChart.update();
      this.avgJitterChart.update();
      this.mAvgJitterChart.update();
      this.packetLossChart.update();
      this.qualityChart.update();
    }, 2000);
    // console.log('!! participant counts', call.participantCounts());
  }

  updateQuality(evt) {
    console.log("!!! updateQuality", evt);
    if (this.localStartTime && this.curThreshold != evt.threshold) {
      const t = evt.threshold;
      this.curThreshold = t;
      // const now = (Date.now() - this.localStartTime) / 1000;
      const now = this.avgJitterVals.videoSend.length;
      console.log("add annotation...", now);
      let annotation = {
        drawTime: "afterDatasetsDraw",
        type: "line",
        xMin: now,
        xMax: now,
        borderWidth: 2,
        label: {
          display: true,
        },
      };
      let name = "";
      switch (t) {
        case "good":
          this.goodCnt += 1;
          name = `good-${this.goodCnt}`;
          annotation.borderColor = "#33FFBD";
          annotation.label.content = "👍";
          annotation.label.position = "90%";
          break;
        case "low":
          this.lowCnt += 1;
          name = `low-${this.lowCnt}`;
          annotation.borderColor = "#FFBD33";
          annotation.label.content = "👎";
          annotation.label.position = "80%";
          break;
        case "very-low":
          this.badCnt += 1;
          name = `bad-${this.badCnt}`;
          annotation.borderColor = "#FF5733";
          annotation.label.content = "🙈";
          annotation.label.position = "70%";
          break;
      }
      this.annotations[name] = annotation;
    }
  }

  updateConnection(evt) {
    console.log("!!! updateConnection", evt);
    if (evt.type !== "signaling") return;
    if (this.localStartTime && this.curConnection !== evt.event) {
      this.curconnection = evt.event;
      const e = evt.event;
      const now = this.avgJitterVals.videoSend.length;
      //   const now = (Date.now() - this.localStartTime) / 1000;
      console.log("add annotation", now);
      let annotation = {
        type: "line",
        xMin: now,
        xMax: now,
        borderWidth: 2,
        label: {
          display: true,
        },
      };
      let name = "";
      switch (e) {
        case "connected":
          this.cxCnt += 1;
          name = `connected-${this.cxCnt}`;
          annotation.borderColor = "#5ee9b7";
          annotation.label.content = "❤️‍🩹";
          annotation.label.position = "60%";
          break;
        case "interrupted":
          this.intCnt += 1;
          name = `interrupt-${this.intCnt}`;
          annotation.borderColor = "#e96645";
          annotation.label.content = "💔";
          annotation.label.position = "50%";
          break;
      }
      this.annotations[name] = annotation;
    }
  }
}
