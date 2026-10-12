import { useMemo, useState } from "react";
import { ALL, BY_ID, STATS, STAT_COL, family, finalsFrom } from "../lib/data.js";
import { NATURES, PRICE_DEFAULTS, abilName, abilityRanking, breedInfo, buildTree, natFx, natName, perfect, planSummary, recommend } from "../lib/breeding.js";
import { nameOf, useLang } from "../lib/i18n.js";
import { useStored } from "../lib/storage.js";
import { href } from "../lib/router.js";
import { decodePlan, encodePlan, shareUrl } from "../lib/share.js";
import { Dropdown, Sprite } from "../components/ui.jsx";
import PokemonForm from "../components/PokemonForm.jsx";
import AbilityTag from "../components/AbilityTag.jsx";

const DITTO = 132;
const btn = "inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[0.84rem]";
const btnMain = `${btn} bg-fg font-medium text-bg hover:bg-accent-ink`;
const btnGhost = `${btn} border border-line text-fg hover:border-accent`;

export default function Breeding({ p, shared }) {
  const { lang, t } = useLang();
  const info = useMemo(() => breedInfo(p), [p]);
  const finals = useMemo(() => finalsFrom(p), [p]);
  const famIds = useMemo(() => new Set(family(p).map(f => f.id)), [p]);
  // Espèces qu'on peut utiliser dans cet élevage : la famille, le même groupe œuf, et Métamorph
  const allowed = useMemo(
    () => ALL.filter(q => famIds.has(q.id) || q.id === DITTO || (!q.eggGroups.includes("cannot breed") && q.eggGroups.some(e => info.groups.includes(e)))),
    [famIds, info]
  );
  const allowedIds = useMemo(() => new Set(allowed.map(q => q.id)), [allowed]);

  // Plan partagé par lien : on l'affiche sur une copie temporaire, sans toucher aux données du visiteur
  const sharedData = useMemo(() => (shared ? decodePlan(shared) : null), [shared]);
  const isShared = !!sharedData && famIds.has(sharedData.species);

  const [storedIvs, setStoredIvs] = useStored("ivs", STATS);
  const [storedNatured, setStoredNatured] = useStored("natured", true);
  const [storedBox, setStoredBox] = useStored("box", []);
  const [tmpIvs, setTmpIvs] = useState(() => sharedData?.ivs ?? STATS);
  const [tmpNatured, setTmpNatured] = useState(() => sharedData?.natured ?? true);
  const [tmpBox, setTmpBox] = useState(() => sharedData?.box ?? []);
  const [ivs, setIvs] = isShared ? [tmpIvs, setTmpIvs] : [storedIvs, setStoredIvs];
  const [natured, setNatured] = isShared ? [tmpNatured, setTmpNatured] : [storedNatured, setStoredNatured];
  const [box, setBox] = isShared ? [tmpBox, setTmpBox] : [storedBox, setStoredBox];

  const [prices, setPrices] = useStored("prices", PRICE_DEFAULTS);
  const [showTree, setShowTree] = useState(false);
  const [pricesOpen, setPricesOpen] = useState(false);
  const [form, setForm] = useState(null); // { mode: "add" | "edit" | "done", item?, nodeId? }
  const [targetId, setTargetId] = useState(() => (isShared ? sharedData.target : null));
  const [natureChoice, setNatureChoice] = useState(() => (isShared && sharedData.nature ? { k: sharedData.nature, for: sharedData.target } : null));
  const [sharePanel, setSharePanel] = useState(false);
  const [shareName, setShareName] = useStored("shareName", "");
  const [copied, setCopied] = useState(false);
  const [imported, setImported] = useState(false);

  const target = finals.find(f => f.id === targetId) || finals[0];
  const rec = recommend(target.stats);
  const nature = natureChoice && natureChoice.for === target.id ? natureChoice.k : rec.primary;
  const abil = abilityRanking(target);
  const chosen = STATS.filter(s => ivs.includes(s));
  const price = { ...PRICE_DEFAULTS, ...prices };
  const myBox = box.filter(it => allowedIds.has(it.species));

  const head = (
    <div className="flex items-center gap-4">
      <span className="grid size-[64px] flex-none place-items-center rounded-[18px] bg-accent-soft"><Sprite p={info.root} className="size-[56px]" /></span>
      <div className="min-w-0">
        <h1 className="text-balance text-[clamp(1.6rem,3.4vw,2.3rem)] font-light leading-[1.05] tracking-[-0.04em]">{t.breedTitle} {nameOf(target, lang)}</h1>
        <p className="mt-1 text-[0.86rem] text-muted">
          {t.eggOf} <b className="font-medium text-fg">{nameOf(info.root, lang)}</b> · {info.groups.map(g => t.egg[g] || g).join(" / ")}
        </p>
      </div>
    </div>
  );
  if (!info.canBreed) return <>{head}<p className="rounded-xl bg-sunk p-4">{t.cannotBreed}</p></>;

  // ---------- Plan ----------
  const ctx = { box: myBox, nature, isFamily: id => famIds.has(id), isCompatible: id => allowedIds.has(id) };
  const tree = chosen.length || natured ? buildTree(chosen, natured, ctx) : null;
  const sum = tree ? planSummary(tree, info.gender.female) : null;
  const cost = sum ? sum.braceTotal * price.brace + sum.ever * price.ever + (sum.genderSel - sum.rareSel) * price.gender + sum.rareSel * price.rare : 0;
  const money = n => n.toLocaleString(lang === "fr" ? "fr-FR" : "en-US") + " $";
  const usedIds = new Set(sum ? sum.owned.map(l => l.owned.id) : []);
  const done = tree?.owned;
  const recIvs = STATS.filter(s => !rec.useless.includes(s));
  const isRec = recIvs.length === chosen.length && recIvs.every(s => chosen.includes(s)) && natured && nature === rec.primary;

  // ---------- Actions sur la boîte ----------
  const saveItem = item => {
    setBox(cur => (cur.some(x => x.id === item.id) ? cur.map(x => (x.id === item.id ? item : x)) : [...cur, item]));
    setForm(null);
  };
  const removeItem = id => setBox(cur => cur.filter(x => x.id !== id));
  // Accouplement fait : les parents possédés disparaissent, le bébé rejoint la boîte
  const finishBreed = (node, child) => {
    const gone = new Set(node.kids.filter(k => k.owned).map(k => k.owned.id));
    setBox(cur => [...cur.filter(x => !gone.has(x.id)), child]);
    setForm(null);
  };
  const childDraft = node => {
    const mother = node.kids.find(k => k.gender === "F") || node.kids[0];
    const species = node.spine ? info.root.id : mother.owned && mother.owned.species !== DITTO ? mother.owned.species : node.kids.find(k => k.owned && k.owned.species !== DITTO)?.owned.species ?? null;
    return {
      species,
      gender: node.gender || "F",
      ivs: Object.fromEntries(STATS.map(s => [s, node.ivs.includes(s) ? 31 : null])),
      nature: node.nat ? nature : null,
    };
  };

  const nodeCtx = { info, nature, lang, t };

  // ---------- Partage ----------
  const link = shareUrl(p.id, encodePlan({ species: p.id, target: target.id, ivs: chosen, natured, nature, box: myBox, name: shareName }));
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(link); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { document.getElementById("share-link")?.select(); }
  };
  const importShared = () => {
    const stamp = Date.now();
    setStoredBox(cur => [...cur, ...sharedData.box.map((it, k) => ({ ...it, id: stamp + k }))]);
    setImported(true);
  };
  const leaveShared = () => { location.hash = href({ page: "pokemon", id: p.id, tab: "elevage" }).slice(1); };
  const ready = sum ? sum.steps.flat().filter(n => n.kids.every(k => !k.kids)) : [];

  return (
    <>
      {head}

      {isShared ? (
        <section className="grid gap-3 rounded-2xl border border-accent bg-accent-soft p-4">
          <div>
            <h2 className="text-[1.05rem] font-medium">{sharedData.name ? t.sharedBy(sharedData.name) : t.sharedPlan}</h2>
            <p className="mt-1 text-[0.86rem] text-muted">{t.sharedText(sharedData.box.length)}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {sharedData.box.length > 0 && (
              imported
                ? <span className={`${btn} bg-panel text-accent-ink`}>✓ {t.importedDone}</span>
                : <button type="button" className={btnMain} onClick={importShared}>{t.importShared(sharedData.box.length)}</button>
            )}
            <button type="button" className={`${btnGhost} bg-panel`} onClick={leaveShared}>{t.backToMine}</button>
          </div>
        </section>
      ) : (
        <section className="grid gap-3 rounded-2xl border border-line bg-panel p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[1.05rem] font-medium">{t.shareTitle}</h2>
              <p className="mt-0.5 text-[0.84rem] text-muted">{t.shareText}</p>
            </div>
            <button type="button" aria-expanded={sharePanel} className={sharePanel ? btnGhost : btnMain} onClick={() => setSharePanel(o => !o)}>{sharePanel ? t.close : t.shareBtn}</button>
          </div>
          {sharePanel && (
            <div className="grid gap-2.5 rounded-xl bg-sunk p-3">
              <label className="grid gap-1 text-[0.8rem] text-muted">
                {t.shareName}
                <input id="share-name" value={shareName} maxLength={24} onChange={e => setShareName(e.target.value)} placeholder={t.shareNamePh}
                  className="h-9 max-w-[260px] rounded-[9px] border border-line bg-panel px-2.5 text-[0.9rem] text-fg focus:border-accent focus:outline-none" />
              </label>
              <div className="flex flex-wrap gap-2">
                <input id="share-link" readOnly value={link} onFocus={e => e.target.select()}
                  className="h-9 min-w-0 flex-1 basis-[260px] rounded-[9px] border border-line bg-panel px-2.5 font-mono text-[0.76rem] text-muted" />
                <button type="button" className={btnMain} onClick={copyLink}>{copied ? `✓ ${t.copied}` : t.copyLink}</button>
              </div>
              <p className="text-[0.78rem] text-faint">{t.shareNote(myBox.length)}</p>
            </div>
          )}
        </section>
      )}

      {/* 1. Objectif */}
      <section className="grid gap-4 rounded-2xl border border-line bg-panel p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="text-[1.05rem] font-medium"><span className="mr-2 font-mono text-faint">1</span>{isShared ? t.goalTitleShared : t.goalTitle}</h2>
          {finals.length > 1 && (
            <Dropdown label={t.evolvesTo} active value={String(target.id)} onChange={v => setTargetId(+v)} align="right"
              options={finals.map(f => ({ value: String(f.id), label: nameOf(f, lang), short: `→ ${nameOf(f, lang)}` }))} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1" role="group" aria-label={t.formIvs}>
            {STATS.map(s => {
              const on = chosen.includes(s);
              return (
                <button key={s} type="button" aria-pressed={on} style={{ "--s": STAT_COL[s] }}
                  onClick={() => setIvs(cur => (cur.includes(s) ? cur.filter(x => x !== s) : STATS.filter(x => cur.includes(x) || x === s)))}
                  className={`grid h-11 min-w-[52px] place-content-center rounded-[11px] px-2.5 text-[0.8rem] font-medium leading-tight ${on ? "iv-chip border border-transparent text-fg" : "border border-dashed border-line text-faint"}`}>
                  {t.short[s]}<small className="font-mono text-[0.66rem] font-normal">31</small>
                </button>
              );
            })}
          </div>
          <button type="button" aria-pressed={natured} onClick={() => setNatured(!natured)}
            className={`h-11 rounded-[11px] px-3 text-[0.82rem] font-medium ${natured ? "border border-transparent bg-accent-soft text-accent-ink" : "border border-dashed border-line text-faint"}`}>
            {natured ? `${t.nature} ✓` : t.nature}
          </button>
          {natured && (
            <Dropdown size="lg" label={t.nature} active value={nature} onChange={k => setNatureChoice({ k, for: target.id })}
              options={Object.keys(NATURES).filter(k => NATURES[k][0]).map(k => ({ value: k, label: natName(k, lang), tag: natFx(k, t) }))} />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-xl bg-sunk px-3.5 py-2.5 text-[0.86rem]">
          <span className="text-muted">{t.advice} :</span>
          <b className="font-medium">{natName(rec.primary, lang)}</b><span className="font-mono text-[0.74rem] text-accent-ink">{natFx(rec.primary, t)}</span>
          <span className="text-faint">·</span>
          <AbilityTag name={abil[0].name} hidden={abil[0].hidden} size="sm" />
          <span className="text-faint">·</span>
          <b className="font-medium">{recIvs.length}×31</b>{rec.useless.length > 0 && <span className="text-muted">{t.withoutIv(rec.useless.map(s => t.short[s]).join(", "))}</span>}
          {!isRec && (
            <button type="button" className="ml-auto rounded-lg bg-panel px-3 py-1 text-[0.82rem] font-medium text-accent-ink shadow-[0_1px_2px_rgb(0_0_0/0.08)] hover:text-fg"
              onClick={() => { setIvs(recIvs); setNatured(true); setNatureChoice({ k: rec.primary, for: target.id }); }}>
              {t.applyAdvice}
            </button>
          )}
          <p className="basis-full text-[0.8rem] text-muted">{t.roles[rec.role]}{abil[0].hidden && abil.find(a => !a.hidden) ? " " + t.haNote(abilName(abil.find(a => !a.hidden).name, lang)) : ""}</p>
        </div>
      </section>

      {/* 2. Mes Pokémon */}
      <section className="grid gap-3 rounded-2xl border border-line bg-panel p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-[1.05rem] font-medium"><span className="mr-2 font-mono text-faint">2</span>{isShared ? t.boxTitleShared : t.boxTitle}</h2>
          {!form && <button type="button" className={btnMain} onClick={() => setForm({ mode: "add" })}>+ {t.addPokemon}</button>}
        </div>
        <p className="text-[0.84rem] text-muted">{isShared ? t.boxHintShared : t.boxHint}</p>
        {form && form.mode !== "done" && (
          <PokemonForm key={form.item?.id || "new"} initial={form.item} allowed={allowed} title={form.mode === "edit" ? t.editPokemon : t.addPokemon} onSave={saveItem} onCancel={() => setForm(null)} />
        )}
        {myBox.length > 0 ? (
          <ul className="grid gap-1.5">
            {myBox.map(it => (
              <BoxRow key={it.id} it={it} used={usedIds.has(it.id)} onEdit={() => setForm({ mode: "edit", item: it })} onRemove={() => removeItem(it.id)} />
            ))}
          </ul>
        ) : (
          !form && <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-[0.88rem] text-muted">{t.boxEmpty}</p>
        )}
        {box.length > myBox.length && <p className="text-[0.78rem] text-faint">{t.boxOthers(box.length - myBox.length)}</p>}
      </section>

      {/* 3. Plan */}
      {!tree ? (
        <p className="rounded-xl bg-sunk p-4">{t.pickSomething}</p>
      ) : done ? (
        <section className="rounded-2xl border border-accent bg-accent-soft p-5">
          <h2 className="text-[1.15rem] font-medium">{t.alreadyDone}</h2>
          <p className="mt-1 text-[0.9rem] text-muted">{t.alreadyDoneText}</p>
        </section>
      ) : (
        <section className="grid gap-5 rounded-2xl border border-line bg-panel p-4">
          <h2 className="text-[1.05rem] font-medium"><span className="mr-2 font-mono text-faint">3</span>{t.planTitle}</h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-px overflow-hidden rounded-xl border border-line bg-line">
            {[[t.breedsLeft, sum.breeds], [t.toFind, sum.toGet.length], [t.items, sum.braceTotal + sum.ever]].map(([k, v]) => (
              <div key={k} className="grid gap-0.5 bg-panel px-4 py-3"><span className="eyebrow">{k}</span><b className="font-mono text-[1.5rem] font-normal tabular-nums">{v}</b></div>
            ))}
            <div className="grid gap-0.5 bg-panel px-4 py-3">
              <span className="eyebrow">{t.estCost}</span>
              <b className="font-mono text-[1.25rem] font-normal text-accent-ink">{money(cost)}</b>
              <button type="button" className="justify-self-start text-[0.76rem] text-muted underline underline-offset-4 hover:text-fg" onClick={() => setPricesOpen(o => !o)}>{pricesOpen ? t.closePrices : t.editPrices}</button>
            </div>
          </div>
          {pricesOpen && (
            <div className="-mt-3 flex flex-wrap items-end gap-2.5 rounded-xl bg-sunk p-3">
              {[["brace", t.priceBrace], ["ever", t.priceEver], ["gender", t.priceGender], ["rare", t.priceRare]].map(([k, label]) => (
                <label key={k} className="grid gap-1 text-[0.78rem] text-muted">
                  {label}
                  <input id={"price-" + k} type="number" min="0" step="500" value={price[k]} onChange={e => setPrices({ ...price, [k]: Math.max(0, +e.target.value || 0) })}
                    className="h-9 w-[120px] rounded-[9px] border border-line bg-panel px-2.5 font-mono text-[0.86rem]" />
                </label>
              ))}
              <p className="basis-full text-[0.8rem] text-muted">{t.priceNote}</p>
            </div>
          )}

          {sum.toGet.length > 0 && <ShoppingList sum={sum} info={info} nature={nature} />}

          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="eyebrow">{showTree ? t.tree : t.todoTitle}</h3>
              <button type="button" className="text-[0.82rem] text-muted underline underline-offset-4 hover:text-fg" onClick={() => setShowTree(s => !s)}>{showTree ? t.showSteps : t.showTree}</button>
            </div>
            {showTree ? (
              <div className="max-h-[78vh] overflow-auto rounded-xl bg-sunk p-3 [scrollbar-width:thin]">
                <div className="inline-flex min-w-max"><TreeNode n={tree} ctx={nodeCtx} /></div>
              </div>
            ) : (
              <ol className="grid gap-4">
                {sum.steps.map((list, i) => (
                  <li key={i}>
                  <details open={i === 0} className="group grid gap-2">
                    <summary className="flex cursor-pointer list-none items-baseline gap-2.5 text-[0.86rem] [&::-webkit-details-marker]:hidden">
                      <span className="text-faint transition-transform group-open:rotate-90">›</span>
                      <b className="font-medium">{t.step} {i + 1}</b><span className="text-faint">{t.nBreeds(list.length)}</span>
                      {i === 0 && <span className="rounded-full bg-accent px-2 py-px text-[0.7rem] font-medium text-panel">{t.nowLabel}</span>}
                    </summary>
                    <div className="mt-2 grid gap-2">
                    {list.map(n => {
                      const isReady = ready.includes(n);
                      return (
                        <div key={n.id} className={`grid gap-2 rounded-xl p-2 ${isReady ? "bg-accent-soft/60" : ""}`}>
                          {form?.mode === "done" && form.nodeId === n.id ? (
                            <PokemonForm initial={form.item} allowed={allowed} title={t.recordBaby} onSave={child => finishBreed(n, child)} onCancel={() => setForm(null)} />
                          ) : (
                            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
                              <Node n={n.kids[0]} ctx={nodeCtx} /><span className="flex-none text-faint">×</span>
                              <Node n={n.kids[1]} ctx={nodeCtx} /><span className="flex-none text-faint">→</span>
                              <Node n={n} ctx={nodeCtx} />
                              {isReady && (
                                <button type="button" className={`${btnGhost} ml-1 flex-none bg-panel`} onClick={() => setForm({ mode: "done", nodeId: n.id, item: childDraft(n) })}>✓ {t.markDone}</button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                    </div>
                  </details>
                  </li>
                ))}
              </ol>
            )}
            <div className="flex flex-wrap gap-3 text-[0.74rem] text-muted">
              {STATS.map(s => <span key={s} className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: STAT_COL[s] }} />{t.stats[s]}</span>)}
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-3.5 rounded-[3px] border-[1.5px] border-accent" />{t.spineLegend}</span>
              <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-3.5 rounded-[3px] bg-accent" />{t.ownedLegend}</span>
            </div>
          </div>
        </section>
      )}

      <details className="rounded-2xl border border-line bg-panel px-4 py-3 text-[0.86rem] text-muted">
        <summary className="cursor-pointer font-medium text-fg">{t.rulesTitle}</summary>
        <ul className="mt-2 grid max-w-[70ch] list-disc gap-1 pl-[18px]">{t.rules.map(r => <li key={r}>{r}</li>)}</ul>
        {info.needsDitto && <p className="mt-2">{t.dittoWarn}</p>}
        {info.gender.kind === "F" && <p className="mt-2">{t.femaleOnlyHint}</p>}
      </details>
    </>
  );
}

function BoxRow({ it, used, onEdit, onRemove }) {
  const { lang, t } = useLang();
  const p = BY_ID.get(it.species);
  const p31 = perfect(it);
  const [confirm, setConfirm] = useState(false);
  if (!p) return null;
  return (
    <li className={`flex flex-wrap items-center gap-3 rounded-xl border px-3 py-2 ${used ? "border-accent bg-accent-soft/50" : "border-line"}`}>
      <span className="grid size-10 flex-none place-items-center"><Sprite p={p} className="size-10" /></span>
      <div className="grid min-w-0 flex-1 gap-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          <b className="font-medium">{nameOf(p, lang)}</b>
          <span className={it.gender === "F" ? "text-[oklch(0.62_0.16_0)]" : it.gender === "M" ? "text-[oklch(0.6_0.13_250)]" : "text-faint"}>{it.gender === "F" ? "♀" : it.gender === "M" ? "♂" : "∅"}</span>
          {it.nature && <span className="text-[0.82rem] text-muted">{natName(it.nature, lang)}</span>}
          {it.ability && <span className="text-[0.82rem] text-muted">· {abilName(it.ability, lang)}</span>}
          {used && <span className="rounded-full bg-accent px-2 py-px text-[0.7rem] font-medium text-panel">{t.usedInPlan}</span>}
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {STATS.map(s => {
            const v = it.ivs?.[s];
            return (
              <span key={s} style={{ "--s": STAT_COL[s] }} className={`rounded-[5px] px-1.5 py-px font-mono text-[0.7rem] ${v === 31 ? "iv-chip font-medium text-fg" : "bg-sunk text-faint"}`}>
                {t.short[s]} {v ?? "?"}
              </span>
            );
          })}
          <span className="ml-1 font-mono text-[0.72rem] text-faint">{p31.length}×31</span>
        </div>
      </div>
      <div className="flex gap-1.5">
        <button type="button" className="h-8 rounded-lg border border-line px-2.5 text-[0.8rem] text-muted hover:text-fg" onClick={onEdit}>{t.edit}</button>
        {confirm ? (
          <button type="button" className="h-8 rounded-lg bg-[oklch(0.6_0.18_25)] px-2.5 text-[0.8rem] font-medium text-white" onClick={onRemove} onBlur={() => setConfirm(false)} autoFocus>{t.confirmRemove}</button>
        ) : (
          <button type="button" className="h-8 rounded-lg border border-line px-2.5 text-[0.8rem] text-muted hover:text-fg" onClick={() => setConfirm(true)}>{t.remove}</button>
        )}
      </div>
    </li>
  );
}

function ShoppingList({ sum, info, nature }) {
  const { lang, t } = useLang();
  const groups = {};
  const spine = sum.toGet.find(l => l.spine);
  sum.toGet.filter(l => !l.spine).forEach(l => {
    const g = (groups[l.ivs[0]] ||= { M: 0, F: 0 });
    g[l.gender || "M"]++;
  });
  return (
    <div className="grid gap-2">
      <h3 className="eyebrow">{t.toGet}</h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-2">
        {spine && (
          <div className="flex items-center gap-3 rounded-xl border border-accent px-3 py-2">
            <span className="grid size-10 flex-none place-items-center"><Sprite p={info.root} className="size-10" /></span>
            <div className="grid min-w-0">
              <b className="text-[0.9rem] font-medium">1 × {nameOf(info.root, lang)} ♀</b>
              <span className="text-[0.76rem] text-muted">{spine.nat ? t.spineNat(natName(nature, lang)) : t.spineIv(t.stats[spine.ivs[0]])}</span>
            </div>
          </div>
        )}
        {STATS.filter(s => groups[s]).map(s => (
          <div key={s} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
            <span className="iv-chip grid size-10 flex-none place-items-center rounded-xl text-[0.74rem] font-semibold" style={{ "--s": STAT_COL[s] }}>{t.short[s]}</span>
            <div className="grid min-w-0">
              <b className="text-[0.9rem] font-medium">{groups[s].M + groups[s].F} × 31 {t.stats[s]}</b>
              <span className="text-[0.76rem] text-muted">{groups[s].M} ♂ · {groups[s].F} ♀ · {t.anyCompatible}</span>
            </div>
          </div>
        ))}
      </div>
      {info.males.length > 0 && (
        <p className="text-[0.8rem] text-muted">
          {t.compatHint(info.groups.map(g => t.egg[g] || g).join(" / "))}{" "}
          {info.males.map(({ q, horde }, i) => (
            <span key={q.id}>{i > 0 && ", "}<a className="text-accent-ink underline decoration-accent/40 underline-offset-[3px]" href={href({ page: "pokemon", id: q.id, tab: "lieux" })}>{nameOf(q, lang)}</a>{horde && <sup className="ml-0.5 text-[0.65rem] text-accent-ink">H</sup>}</span>
          ))}.
        </p>
      )}
    </div>
  );
}

function TreeNode({ n, ctx }) {
  if (!n.kids) return <div className="tree-br"><Node n={n} ctx={ctx} /></div>;
  return (
    <div className="tree-br">
      <div className="tree-kids">{n.kids.map(k => <TreeNode key={k.id} n={k} ctx={ctx} />)}</div>
      <Node n={n} ctx={ctx} root={n.id === 0} />
    </div>
  );
}

function Node({ n, ctx, root = false }) {
  const { info, nature, lang, t } = ctx;
  const ownedP = n.owned ? BY_ID.get(n.owned.species) : null;
  const who = ownedP ? nameOf(ownedP, lang) : n.spine ? nameOf(info.root, lang) : t.anyMale;
  return (
    <div
      className={`tree-node grid flex-none gap-[5px] rounded-[11px] border px-[9px] py-[7px] text-[0.76rem] ${
        n.owned ? "w-[156px] border-accent bg-accent-soft" : root ? "w-[176px] border-[1.5px] border-accent bg-panel shadow-soft" : n.spine ? "w-[156px] border-accent/55 bg-panel" : "w-[156px] border-line bg-panel"
      }`}
    >
      <div className="flex min-w-0 items-center gap-[5px]">
        {n.gender && <span className={`text-[0.86rem] font-semibold leading-none ${n.gender === "F" ? "text-[oklch(0.62_0.16_0)]" : "text-[oklch(0.6_0.13_250)]"}`}>{n.gender === "F" ? "♀" : "♂"}</span>}
        <span className={`min-w-0 flex-1 truncate ${n.spine || n.owned ? "font-medium text-fg" : "text-muted"}`}>{who}</span>
        {n.owned ? <span className="rounded-full bg-accent px-1.5 text-[0.62rem] font-medium text-panel">{t.ownedShort}</span> : n.ivs.length > 0 && <span className="font-mono text-[0.68rem] text-faint">{n.ivs.length}×31</span>}
      </div>
      <div className="flex flex-wrap gap-[3px]">
        {n.ivs.length || n.nat ? (
          <>
            {STATS.filter(s => n.ivs.includes(s)).map(s => <b key={s} className="iv-chip rounded-[5px] px-[5px] py-px text-[0.68rem] font-medium" style={{ "--s": STAT_COL[s] }}>{t.short[s]}</b>)}
            {n.nat && <b className="rounded-[5px] bg-accent-soft px-[5px] py-px text-[0.68rem] font-medium text-accent-ink">{natName(nature, lang)}</b>}
          </>
        ) : (
          <span className="text-[0.7rem] text-faint">{t.anyIv}</span>
        )}
      </div>
      {n.item && (
        <span className="truncate border-t border-dashed border-line pt-1 text-[0.68rem] text-muted">
          <span className="text-accent">◆ </span>{n.item === "ever" ? t.everstone : t.braces[n.item]}
        </span>
      )}
    </div>
  );
}
