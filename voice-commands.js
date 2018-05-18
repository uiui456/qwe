/* global document, webkitSpeechRecognition */
import {
  Scenario0,
  Scenario1,
  Scenario2,
  Scenario5,
  Scenario6,
  Scenario7,
  Scenario8 // log me out
} from './scenarios'

export class VoiceCommands {
  constructor() {
    this.mic = document.querySelector('#mic')
    this.listening = document.querySelector('#listening')
    this.modals = document.querySelector('#modals')
    this.voice = null
    this.utterance = null

    this.initVoice()
  }

  initVoice = () => { /* eslint-disable-line no-unused-vars */
    if (window.hasOwnProperty('webkitSpeechRecognition')) {
      const watch = setInterval(() => {
        // Load all voices available
        const voicesAvailable = window.speechSynthesis.getVoices()

        if (voicesAvailable.length !== 0) {
          this.voice = window.speechSynthesis.getVoices().filter(e => e.lang === 'en-US')[2]
          clearInterval(watch)
        }
      }, 1)

      document.querySelector('#speech').style.visibility = 'visible'

      this.mic.addEventListener('click', () => {
        this.voiceCommand(this.processResult)
      })
    }
  }

  isCommandMatched(command, expectedCommand) {
    return expectedCommand.every((c) => command.indexOf(c) !== -1)
  }

  successCallback = async (Scenario) => {
    return new Promise((resolve, reject) => {
      const msg = Scenario.feedbackMessage()

      this.listening.innerHTML = msg
      this.say(msg, Scenario.execute((text) => {
        this.listening.innerHTML = ''
        this.say(text)
        resolve()
      }))
    })
  }

  voiceCommand = (onResult, command) => {
    const recognition = new webkitSpeechRecognition() /* eslint-disable-line new-cap */

    recognition.continuous = true
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onresult = (e) => {
      const text = e.results[0][0].transcript

      recognition.stop()
      onResult(text, null, command)
    }

    recognition.onerror = (e) => {
      recognition.stop()
      onResult(null, e, command)
    }

    recognition.onstart = () => {
      this.listening.innerHTML = 'Listening...'
    }

    recognition.start()
  }

  processResult = (text, error, command) => {
    if (error) {
      if (error.error === 'no-speech') {
        this.listening.innerHTML = 'Sorry. Try again.'
        this.say('Sorry. Try again.', () => {
          this.listening.innerHTML = ''
        })
      }
      else {
        this.listening.innerHTML = ''
        console.error(error)
      }
    }
    else if (text) {
      this.listening.innerHTML = ''
      this.processCommands(text, command)
    }
  }

  say = (text, onEnd) => {
    window.speechSynthesis.cancel()
    this.utterance = new SpeechSynthesisUtterance()

    this.utterance.onend = () => {
      if (onEnd) {
        onEnd()
      }
    }

    this.utterance.onerror = (e) => {
      console.error(e)
      if (onEnd) {
        onEnd()
      }
    }

    this.utterance.text = text
    this.utterance.voice = this.voice

    window.speechSynthesis.speak(this.utterance)
  }

  processCommands = async (text, currentCommand) => {
    const command = text.toLowerCase()

    if (currentCommand) { // chained commands
      switch (currentCommand.type) {
        case 'some command':
          if (currentCommand.step === 1) {
            const nextCommand = {
              type: 'some command',
              step: 2,
              data: { }
            }

            const msg = `${text}. Proceed?`

            this.listening.innerHTML = msg
            this.say(msg, () => {
              this.voiceCommand(this.processResult, nextCommand)
            })
          }
          else if (currentCommand.step === 2) {
            this.listening.innerHTML = ''
            if (command.indexOf('yes') !== -1 || command.indexOf('proceed') !== -1) {
              //
              this.say('proceeding', () => {
                // do something
              })
            }
            else {
              this.say('canceled')
            }
          }

          break

        default:
          break
      }
    }

    // Demo
    else if (this.isCommandMatched(command, ['hackathon', 'demo'])) {
      const scenarios = [Scenario0, Scenario2, Scenario7]

      for (let k = 0; k < scenarios.length; k++) {
        await setTimeout(async () => { await this.successCallback(scenarios[k]) }, 2000)
      }
    }

    // Log me in
    else if (this.isCommandMatched(command, ['log', 'me', 'in'])) {
      await this.successCallback(Scenario0)
    }

    // SU19 ACTION SPORTS
    else if (this.isCommandMatched(command, ['summer', '19', 'action sport'])) {
      await this.successCallback(Scenario1)
    }

    // Vapor Max Line for FA19
    else if (this.isCommandMatched(command, ['fall', '19', 'vapormax', 'line'])) {
      await this.successCallback(Scenario2)
    }

    // Running filter
    else if (this.isCommandMatched(command, ['running', 'filter'])) {
      await this.successCallback(Scenario5)
    }

    // shareboard
    else if (this.isCommandMatched(command, ['storyboard'])) {
      await this.successCallback(Scenario6)
    }

    // pricepoint
    else if (this.isCommandMatched(command, ['price', 'point'])) {
      await this.successCallback(Scenario7)
    }

    // Log me Out
    else if (this.isCommandMatched(command, ['log', 'me', 'out'])) {
      await this.successCallback(Scenario8)
    }

    else {
      this.say(text)
      this.listening.innerHTML = text
    }
  }
}
