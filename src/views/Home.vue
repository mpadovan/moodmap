<template>
  <div class="train">
    <template v-if="!istraining">
      <template v-if="mode == 'train'">
        <select id="emotion_options">
          <template v-for="(emotion, index) in emotions">
            <option :key="index" :value="index">{{emotion}}</option>
          </template>
        </select>
        <button v-on:click="trainModel()">Train Model</button>
      </template>
      <template v-if="detected_e == 'happiness'">
        <h1>You look happy! You may like these stores</h1>
        <video width="700" autoplay>
          <source src="maps/3d_moving_map_happy_low.mov" type="video/mp4" />
        </video>
      </template>
      <template v-if="detected_e == 'anger'">
        <h1>You seem to be angry. Maybe you need a pick-up!</h1>
        <video width="700" autoplay>
          <source src="maps/3d_moving_map_angry_low.mov" type="video/mp4" />
        </video>
      </template>
      <template v-if="detected_e == 'sadness'">
        <h1>Why so blue? These stores may give you a smile</h1>
        <video width="700" autoplay>
          <source src="maps/3d_moving_map_sad_low.mov" type="video/mp4" />
        </video>
      </template>
      <Camera ref="cchild" id="cam"></Camera>
    </template>
    <template v-if="istraining">
      <div><img src="https://samherbert.net/svg-loaders/svg-loaders/tail-spin.svg" id="load" /></div>
      <div><img v-bind:src="image" id="imgtt" v-on:load="onload"/></div>
    </template>
  </div>
</template>

<script>
// @ is an alias to /src
import Camera from "@/components/Camera.vue";
import * as tf from "@tensorflow/tfjs";
import * as mobilenetModule from "@tensorflow-models/mobilenet";
import * as knnClassifier from "@tensorflow-models/knn-classifier";
import axios from "axios";

export default {
  name: "Home",
  components: {
    Camera
  },
  data: function() {
    return {
      emotions: [
        "happiness",
        "neutral",
        "surprise",
        "sadness",
        "anger",
        "contempt",
        "fear"
      ],
      classifier: null,
      mobilenet: null,
      class: null,
      detected_e: null,
      mode: "test",
      image: null,
      istraining: true,
      index: null,
      imgs: null
    };
  },
  mounted: async function() {
    await this.init();
    await this.startTrain();
    this.intervalFetch();
  },
  methods: {
    async init() {
      // load the load mobilenet and create a KnnClassifier
      this.classifier = knnClassifier.create();
      this.mobilenet = await mobilenetModule.load();
    },
    // trainModel() {
    //   let selected = document.getElementById("emotion_options");
    //   this.class = selected.options[selected.selectedIndex].value;
    //   this.addExample();
    // },
    // addExample() {
    //   const img = tf.browser.fromPixels(this.$refs.cchild.webcam.webcamElement);
    //   const logits = this.mobilenet.infer(img, "conv_preds");
    //   this.classifier.addExample(logits, parseInt(this.class));
    // },
    async getEmotion() {
      const img = tf.browser.fromPixels(this.$refs.cchild.webcam.webcamElement);
      const logits = this.mobilenet.infer(img, "conv_preds");
      const pred = await this.classifier.predictClass(logits);
      console.log(pred);
      this.detected_e = this.emotions[parseInt(pred.label)];
    },
    changeOption() {
      const selected = document.getElementById("use_case");
      this.mode = selected.options[selected.selectedIndex].value;
    },
    startTrain() {
      axios.get("http://localhost:3128/train").then(res => {
        this.imgs = res.data;
        this.index = 0;
        this.image = `images/${this.imgs[this.index].field2}`;
      });
    },
    async onload() {
      const img = tf.browser.fromPixels(document.getElementById("imgtt"));
      const logits = this.mobilenet.infer(img, "conv_preds");
      await this.classifier.addExample(
        logits,
        parseInt(this.imgs[this.index].field3)
      );
      this.index = this.index + 1;
      this.next();
    },
    next() {
      if (this.index < this.imgs.length) {
        this.image = `images/${this.imgs[this.index].field2}`;
      } else {
        this.istraining = false;
      }
    },
    intervalFetch: function() {
      this.intervalid1 = setInterval(() => {
        if (!this.istraining) this.getEmotion();
      }, 2000);
    }
  }
};
</script>

<style scoped>
h1 {
  margin: 2vh;
}
#imgtt {
  opacity: 0;
}
#load {
  margin-top: 20vh;
  height: 12vh;
}
#cam {
  opacity: 0;
}
</style>