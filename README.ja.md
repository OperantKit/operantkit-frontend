# operantkit-frontend

:gb: [English README](README.md)

operantkit-frontend は、Next.js で作った [OperantKit](https://github.com/OperantKit) の Web 画面です。現在動くのは、授業向けのブラウザ上のオペラント箱（自分でレバーを押し、本物のスケジュールエンジンが強化子を決める）と、走っているセッションから累積記録をその場で描くページです。ダッシュボード・データ・設定・アカウントのページは見本の画面で、その API ルートは作り物のデータを返し、どの実験にもつながっていません。

<p align="center"><img src="docs/assets/screenshots/sim.png" width="640" alt="FR 5 のブラウザ上のオペラント箱と、反応・強化子のカウンタ、累積記録"></p>

## 画面

| ページ | 今の動作 |
|---|---|
| `/sim` | ブラウザ上のオペラント箱です。レバーをクリックすると反応になります。FR 5、FR 10、FI 15 秒、VI 10 秒、VI 30 秒は、WebAssembly にコンパイルした [contingency-rs](https://github.com/OperantKit/contingency-rs) が判定します。反応と強化子を数え、給餌器の音を鳴らし、累積記録を描きます。箱の下の VR・DRL・DRH・DRO・CONC のボタンは、箱の絵を切り替えて見せるだけです。 |
| `/session-live` | 別の場所で走っているセッションの累積記録を、[session-visualizer](https://github.com/OperantKit/session-visualizer) の `http://127.0.0.1:8765/events` から読んでその場で描きます（`NEXT_PUBLIC_SESSION_VISUALIZER_URL` で変更できます）。読むだけで、セッションへは何も送りません。 |
| `/cumulative-recorder` | キーボードで操作する累積記録器です。`http://127.0.0.1:8765` のバックエンドが必要ですが、そのバックエンドは OperantKit の organization で公開されていません。無い場合、ページにはデータが出ません。 |
| `/data` | **作り物のデータ**の表・累積記録・反応率のグラフです。サーバ起動時に乱数で作った約 10 分ぶんのイベントで、どのスケジュールやセッションとも関係ありません。 |
| `/settings` | FR・VR・FI・VI・EXT の条件を入力するフォームです。保存しても値はサーバのメモリに置かれるだけで、何も実行されません。 |
| `/login`、`/register`、`/profile` | 見本のアカウント画面です。空でないユーザ名とパスワードなら何でも受け付け、ユーザ名をブラウザのローカルストレージに保存します。本当の認証はありません。 |
| `/` | Next.js の初期ページのままです。サイドバーのリンク（Dashboard、Experiments、Subjects、Data Analysis）はまだどこにもつながっていません。 |

### API ルート

| ルート | 返すもの |
|---|---|
| `GET /api/data` | `/data` に表示される作り物のセッションデータ |
| `GET /api/settings` | メモリにある現在の設定（再起動のたびに既定値に戻る） |
| `POST /api/settings` | メモリ上の設定を置き換える。サーバを止めると消える |

どちらのルートも、OperantKit のパッケージやファイルを読み書きしません。

## インストール

Node.js（このリポジトリは `.mise.toml` でバージョン 24 を指定しています）、npm、Rust と [wasm-pack](https://rustwasm.github.io/wasm-pack/) が必要です。`package.json` はスケジュールエンジンを `../../core/contingency-rs/pkg` にある contingency-rs の WebAssembly ビルドから取るので、2 つのリポジトリをこの配置に置く必要があります:

```bash
mkdir -p core softwares   # in an empty folder
git clone https://github.com/OperantKit/contingency-rs core/contingency-rs
git clone https://github.com/OperantKit/operantkit-frontend softwares/operantkit-frontend
cd softwares/operantkit-frontend
npm run wasm:build   # builds ../../core/contingency-rs/pkg with wasm-pack
npm ci
npm run build
```

WebAssembly のビルドが無いと、`npm ci` は `core/contingency-rs/pkg` について `ENOENT: Could not read package.json` で止まります。最初の `wasm:build` には約 7 分かかりました。

その後、開発用サーバを起動して http://localhost:3000/sim を開きます:

```bash
npm run dev
```

`127.0.0.1` ではなく `localhost` を使ってください。開発用サーバは他のホスト名に対して一部の資源をブロックし、`127.0.0.1` で開いたときは箱に「WASM ready」が出ませんでした。

## 制限

- **ほとんどのページは見本です。** 実際のスケジュールの動作や実際のセッションのデータを示すのは `/sim` と `/session-live` だけです。`/data` や `/settings` を実験に使わないでください。
- **単独ではインストールできません。** contingency-rs への `file:` 依存があるため、1 つの clone だけでは入りません。
- **ブラウザの箱はブラウザの時計で時間を測ります。** 反応の時刻はページの時計によるもので、時間精度が重要な用途には向きません。

このリポジトリで作業する AI のコーディング支援ツールは [AGENTS.md](AGENTS.md) を読んでください。

## 開発

```bash
npm run lint
npx tsc --noEmit
npx playwright install chromium   # once
npm test                          # Playwright end-to-end tests
```

## ライセンス

このリポジトリにはまだライセンスファイルがありません。
