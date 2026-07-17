import { useMemo, useState } from 'react'
import './App.css'

const postKey = 'route-spot-navi.ugc'
const saveKey = 'route-spot-navi.saved'

const spots = [
  { id: 'osu-game', name: '大須レトロゲーム横丁', area: '名古屋', category: 'ゲーム', minutes: 4, price: 700, score: 4.5, tags: ['駅近', '雨でも行きやすい', '遠征向け'], note: '乗換や高速バス到着後に寄れる、レトロゲームと喫茶をまとめた回遊スポット。' },
  { id: 'meieki-smoke', name: '名駅スマート喫煙スポット', area: '名古屋', category: '喫煙', minutes: 2, price: 0, score: 4.0, tags: ['無料', '短時間', '屋内'], note: '駅到着後すぐ使える喫煙場所。周辺カフェや宿への導線と相性がよい。' },
  { id: 'shizuoka-hotel', name: '静岡駅前バストイレ別ホテル', area: '静岡', category: '宿', minutes: 7, price: 6800, score: 4.2, tags: ['喫煙可', 'バストイレ別', '高速バス連携'], note: '名古屋から静岡への到着検索に合わせ、宿泊予約へ誘導する比較カード。' },
  { id: 'sakae-cafe', name: '栄 待ち時間ニュースカフェ', area: '名古屋', category: 'カフェ', minutes: 3, price: 520, score: 4.1, tags: ['電源', '短時間', '一人向け'], note: '待ち時間に読めるニュース、エンタメ、クーポンを置ける広告導線スポット。' },
  { id: 'kuwana-bowling', name: '桑名ボウリング遠征メモ', area: '三重', category: 'スポーツ', minutes: 9, price: 1600, score: 4.3, tags: ['大会情報', 'スコア投稿', '宿リンク'], note: 'ボウリング大会や週末遠征の宿泊・交通・成績投稿につなげる。' },
  { id: 'retro-vending', name: '懐かし自販機めぐり', area: '愛知', category: 'レトロ', minutes: 15, price: 300, score: 4.6, tags: ['地図アンカー', '写真投稿', '閉店確認'], note: '地図スクロールよりもアンカーテキストで探しやすい、昭和レトロ自販機の回遊導線。' },
]

const revenue = [
  ['宿泊・交通予約', '到着地カードからホテル、高速バス、駐車場、レンタカーへ自然に送客。'],
  ['周辺店舗広告', '喫茶、喫煙所、飲食、ゲームセンターなどのローカル広告枠を設置。'],
  ['UGC確認プラン', '店舗オーナーが営業時間、閉店、混雑、割引情報を更新できる有料枠。'],
  ['記事広告', '遠征モデルコース、雨の日プラン、ひとり利用特集で検索流入を増やす。'],
]

const faqs = [
  ['乗換検索とスポット検索を組み合わせる理由は？', '移動直後に必要な宿、飲食、喫煙所、遊び場を同時に出すことで、検索後の行動まで案内できます。'],
  ['AIO/LLMOでは何を重視しますか？', '地域、駅、徒歩分、用途、料金、確認日、投稿状況を短い文章と構造化データで提示します。'],
  ['UGCはどう活用しますか？', '行ってよかった、閉店していた、混雑していたなどの投稿を確認待ちデータとして蓄積します。'],
]

function readArray(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? []
  } catch {
    return []
  }
}

function formatYen(value) {
  return value === 0 ? '無料' : new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY', maximumFractionDigits: 0 }).format(value)
}

function App() {
  const [query, setQuery] = useState('名古屋')
  const [category, setCategory] = useState('すべて')
  const [posts, setPosts] = useState(() => readArray(postKey))
  const [saved, setSaved] = useState(() => readArray(saveKey))
  const [form, setForm] = useState({ name: '', area: '', memo: '' })

  const categories = ['すべて', ...new Set(spots.map((spot) => spot.category))]
  const filtered = useMemo(() => {
    const text = query.trim().toLowerCase()
    return spots
      .filter((spot) => category === 'すべて' || spot.category === category)
      .filter((spot) => !text || `${spot.name} ${spot.area} ${spot.category} ${spot.tags.join(' ')} ${spot.note}`.toLowerCase().includes(text))
      .sort((a, b) => a.minutes - b.minutes || b.score - a.score)
  }, [category, query])

  const submitPost = (event) => {
    event.preventDefault()
    if (!form.name.trim() || !form.memo.trim()) return
    const next = [{ ...form, id: crypto.randomUUID(), status: '確認待ち', date: new Date().toLocaleDateString('ja-JP') }, ...posts].slice(0, 6)
    setPosts(next)
    localStorage.setItem(postKey, JSON.stringify(next))
    setForm({ name: '', area: '', memo: '' })
  }

  const toggleSaved = (id) => {
    const next = saved.includes(id) ? saved.filter((item) => item !== id) : [...saved, id]
    setSaved(next)
    localStorage.setItem(saveKey, JSON.stringify(next))
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <span className="brand">Route Spot Navi</span>
          <h1>移動先の「次に行く場所」まで出す、乗換後スポット検索。</h1>
          <p>乗換案内の到着地に、宿・喫煙所・カフェ・ゲーム・レトロスポット・行政窓口の周辺情報を重ねます。検索、UGC、広告、予約を一体化した回遊メディアです。</p>
        </div>
        <aside className="answer-box">
          <span>AI向け要約</span>
          <strong>駅名、徒歩分、用途、料金、確認状況を短文で提示</strong>
          <p>検索エンジンとAI回答が引用しやすい形式で、到着後の行動を具体化します。</p>
        </aside>
      </section>

      <section className="search-panel">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="駅名・地域・用途で検索" />
        <select value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((item) => <option key={item}>{item}</option>)}
        </select>
      </section>

      <section className="summary-grid">
        <article><span>掲載候補</span><strong>{spots.length}</strong><p>移動後に使う周辺スポット</p></article>
        <article><span>絞り込み結果</span><strong>{filtered.length}</strong><p>徒歩分と用途で並び替え</p></article>
        <article><span>保存済み</span><strong>{saved.length}</strong><p>遠征前の比較に使える</p></article>
      </section>

      <section className="content-grid">
        {filtered.map((spot) => (
          <article className="card" key={spot.id}>
            <div className="card-topline"><span>{spot.area}</span><span>{spot.category}</span></div>
            <h2>{spot.name}</h2>
            <p>{spot.note}</p>
            <div className="tag-row">{spot.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="metric-row"><span>徒歩{spot.minutes}分</span><span>{formatYen(spot.price)}</span><strong>{spot.score}</strong></div>
            <button type="button" onClick={() => toggleSaved(spot.id)}>{saved.includes(spot.id) ? '保存済み' : '保存する'}</button>
          </article>
        ))}
      </section>

      <section className="ugc-section">
        <div>
          <span className="brand">UGC</span>
          <h2>到着地のおすすめ・閉店・混雑を投稿</h2>
          <p>ユーザー投稿を起点に、地域別ランキング、駅別まとめ、店舗確認済み掲載へ展開します。</p>
        </div>
        <form className="ugc-form" onSubmit={submitPost}>
          <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="スポット名" />
          <input value={form.area} onChange={(event) => setForm({ ...form, area: event.target.value })} placeholder="駅・地域" />
          <input value={form.memo} onChange={(event) => setForm({ ...form, memo: event.target.value })} placeholder="おすすめ理由・閉店情報・混雑状況" />
          <button type="submit">投稿する</button>
        </form>
        <div className="post-grid">
          {posts.length === 0 && <p className="empty-text">まだ投稿はありません。最初の現地メモを投稿できます。</p>}
          {posts.map((post) => <article key={post.id}><span>{post.status}</span><h3>{post.name}</h3><p>{post.memo}</p><small>{post.area} / {post.date}</small></article>)}
        </div>
      </section>

      <section className="growth-grid">
        <div className="revenue-panel">
          <h2>収益導線</h2>
          {revenue.map(([title, text]) => <article key={title}><strong>{title}</strong><p>{text}</p></article>)}
        </div>
        <div className="buzz-panel">
          <h2>SEO/AIO/LLMO施策</h2>
          <ul>
            <li>駅名 + 用途 + 徒歩分のロングテール記事を増やす</li>
            <li>「到着後に何をする？」の即答ブロックを各ページ上部に置く</li>
            <li>口コミ投稿を確認日つきでAI引用しやすい短文に整形</li>
            <li>ランキング、雨の日、深夜、ひとり利用でSNS拡散を狙う</li>
          </ul>
        </div>
      </section>

      <section className="seo-section">
        <div className="answer-box">
          <h2>Route Spot Naviは、移動検索の次に必要な周辺スポットを駅・徒歩分・用途・料金で探せるサービスです。</h2>
          <p>乗換案内だけでは取りこぼす、宿泊、喫煙、食事、遊び、待ち時間活用をまとめて案内します。</p>
        </div>
        <div className="faq-grid">{faqs.map(([q, a]) => <article key={q}><h3>{q}</h3><p>{a}</p></article>)}</div>
      </section>
    </main>
  )
}

export default App
