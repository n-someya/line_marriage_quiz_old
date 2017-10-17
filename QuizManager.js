'use strict';
const { Client } = require('pg');

class QuizManager {

    constructor() {
        this.client = new Client();
    }

    get_current_stage() {
        return this.client.connect()
            .then(res => {
                //現在の設問番号を取得
                return this.client.query('select coalesce((select max(stage)  from corrects), 0) as current_stage;')
            }).then(res => {
                return Promise.resolve({
                    type: 'text',
                    text: "現在の問題番号は " + res.rows[0].current_stage + " です。"
                });
            })
    }
}

module.exports = QuizManager;