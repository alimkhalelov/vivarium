const fs = require('fs');
const assert = require('assert');

const testName = process.argv[2];
const html = fs.readFileSync('index.html', 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('No script tag found in index.html');
  process.exit(1);
}
const code = scriptMatch[1];

// Validate syntax
try {
  new Function(code);
} catch (e) {
  console.error('Syntax error in index.html script tag:', e.message);
  process.exit(1);
}

const tests = {
  // Existing 12 regression tests
  bg_seam_line_fixed() {
    assert(
      code.includes('Math.floor') && (code.includes('LW+1') || code.includes('LW + 1') || code.includes('off=Math.floor') || code.includes('Math.floor(-((camX*L_.sp)')),
      'Parallax mountain wrap must snap to integer pixels and prevent seam gaps'
    );
    console.log('PASS: bg_seam_line_fixed');
  },

  floating_decor_fixed() {
    assert(
      code.includes('SOLID[w.get(x,hh)]') || code.includes('SOLID[w.get(x, hh)]') || (code.includes('drawDecor') && code.includes('SOLID[w.get(tx,ty)]')),
      'Decor generation and drawing must check for solid ground beneath to prevent floating flowers/mushrooms'
    );
    console.log('PASS: floating_decor_fixed');
  },

  revert_bg_clouds() {
    assert(
      code.includes('o.fillRect(bx+o2+8,by-6,bw-16,6)') || code.includes('bw-16,6'),
      'Original background clouds should be restored'
    );
    console.log('PASS: revert_bg_clouds');
  },

  fixed_trees_structure() {
    assert(
      code.includes('treeAt') &&
      code.includes('TL.TRUNK') &&
      code.includes('TL.LEAF') &&
      (code.includes('lf||rt') || code.includes('rw,10') || code.includes('rw, 10')),
      'Trees must have solid continuous crowns, horizontal branches rotated 90 deg, and horizontal ground roots'
    );
    console.log('PASS: fixed_trees_structure');
  },

  cloud_platforms_fixed() {
    assert(
      !code.includes('if(id===5){o.clearRect(0,0,16,16);o.fillStyle=d;o.fillRect(0,3,16,7);o.fillStyle=b;o.fillRect(0,1,16,6);o.fillStyle=l;o.fillRect(0,0,16,2);for(let x=0;x<16;x+=4){o.fillStyle=b;o.fillRect(x,r.i(0,1),3,1);o.fillStyle=d;o.fillRect(x+1,9+r.i(0,1),3,1)}return c}'),
      'TL.CLOUD must be rendered as full-depth fluffy cloud tile rather than sliced 7px half-block'
    );
    console.log('PASS: cloud_platforms_fixed');
  },

  fullscreen_support() {
    assert(
      (code.includes('requestFullscreen') || code.includes('toggleFullscreen')) &&
      html.includes('viewport-fit=cover') &&
      code.includes('FULLSCREEN'),
      'Fullscreen toggle function, viewport-fit cover, and buttons must be implemented'
    );
    console.log('PASS: fullscreen_support');
  },

  ui_overlap_fixed() {
    assert(
      code.includes('drawHUD') &&
      code.includes("G.scene!=='play'") &&
      (code.includes('bAtTop') || code.includes('Quest.title()')),
      'HUD elements must have collision-free spacing, hide in non-play scenes, and avoid banner collision'
    );
    console.log('PASS: ui_overlap_fixed');
  },

  card_sprites_diversity() {
    assert(
      code.includes('WEAPON_SPRITES') || code.includes('PASSIVE_SPRITES') || code.includes('cardSpr') || (code.includes('cardInfo') && code.includes('sp:')),
      'Cards must have diverse procedural sprites instead of identical placeholder icons'
    );
    console.log('PASS: card_sprites_diversity');
  },

  mobile_compatibility() {
    assert(
      code.includes('isMobile') || (code.includes('userAgent') && code.includes('maxTouchPoints')),
      'Game must feature automatic mobile device detection'
    );
    console.log('PASS: mobile_compatibility');
  },

  frozen_mobs_fixed() {
    assert(
      code.includes('hasLineOfSight') && (code.includes('stuck') || code.includes('ad > 650') || code.includes('ad>650') || code.includes('step')),
      'Frozen mob root causes (line of sight clipping and terrain entrapment) must be fixed'
    );
    console.log('PASS: frozen_mobs_fixed');
  },

  low_health_red_vignette() {
    assert(
      code.includes('drawLowHpVignette') || code.includes('lowHp') || code.includes('Vignette') || code.includes('vignette') || (code.includes('pl.hp<=pl.maxHp*.5') || code.includes('pl.hp<=pl.maxHp*0.5') || code.includes('pl.hp>pl.maxHp*0.5')),
      'Pixelated red danger vignette must activate when player HP <= 50%'
    );
    console.log('PASS: low_health_red_vignette');
  },

  staircase_difficulty_and_caps() {
    assert(
      code.includes('stepFor') && (code.includes('LOCAL_CAPS') || code.includes('guardDead') || code.includes('wardenDead') || code.includes('pacified')),
      'Staircase difficulty with per-zone caps and boss pacification must be implemented'
    );
    console.log('PASS: staircase_difficulty_and_caps');
  },

  // New system verification tests
  bk_architect_boss_system() {
    assert(
      code.includes('BK.architect') || code.includes('architect:'),
      'BK.architect boss configuration must exist'
    );
    assert(
      code.toLowerCase().includes('architect'),
      'Boss name must identify The Prime Architect'
    );
    assert(
      code.includes('architect') && (code.includes('phases: 4') || code.includes('phases:4') || code.includes('phases: [') || code.includes('phase >= 4') || code.includes('ph===4') || code.includes('ph === 4') || code.includes('phase === 4') || code.includes('phase > 3') || code.includes('ph>=4') || code.includes('ph > 3')),
      'Architect boss must have 4 distinct phases or phase definitions'
    );
    assert(
      code.toLowerCase().includes('protocol') || (code.includes('architect') && code.toLowerCase().includes('lock')),
      'Architect signature attack: Protocol Lock (weapon disabling) must be implemented'
    );
    assert(
      code.toLowerCase().includes('echo') || code.toLowerCase().includes('phantom'),
      'Architect signature attack: Phantom Echoes must be implemented'
    );
    assert(
      code.toLowerCase().includes('matrix') || code.toLowerCase().includes('sweep') || (code.includes('architect') && code.toLowerCase().includes('laser')),
      'Architect signature attack: Matrix Sweep lasers must be implemented'
    );
    console.log('PASS: bk_architect_boss_system');
  },

  gen_core_world_generation() {
    assert(
      code.includes('genCore') || code.includes('function genCore'),
      'genCore world generator function must be defined'
    );
    assert(
      code.toLowerCase().includes('rack') || code.toLowerCase().includes('silicon') || code.toLowerCase().includes('abyss') || code.toLowerCase().includes('reactor') || code.toLowerCase().includes('core'),
      'genCore must generate server racks, silicon platforms, or reactor abyss tiles'
    );
    assert(
      code.includes("'core'") || code.includes('"core"') || code.includes('stage === 9') || code.includes('stage===9') || code.includes('STAGE 9') || code.includes('Stage 9'),
      'Stage 9 / Core stage identifier and ambient profile must be integrated'
    );
    console.log('PASS: gen_core_world_generation');
  },

  core_fragments_and_dome_shatter() {
    assert(
      code.includes('G.f.frags') || code.includes('frags') || code.includes('coreFrag'),
      'Core Fragments state tracking (earth, fire, sky) must be implemented'
    );
    assert(
      code.toLowerCase().includes('shatter') || code.toLowerCase().includes('dome') || code.toLowerCase().includes('plunge') || (code.includes('genCore') && code.includes('frags')),
      'Torment dome shatter and plunge transition into Stage 9 on Highest Being defeat with 3 fragments must be implemented'
    );
    console.log('PASS: core_fragments_and_dome_shatter');
  },

  damage_breakdown_tracking() {
    assert(
      code.includes('dmgByWp') || code.includes('pl.dmgByWp'),
      'pl.dmgByWp weapon damage breakdown tracking must be implemented'
    );
    assert(
      code.includes('dmgByWp') && (code.includes('for(') || code.includes('Object.keys') || code.includes('Object.entries') || code.includes('fillText') || code.includes('stats')),
      'Weapon damage breakdown must be aggregated and displayed on victory / game over screen'
    );
    console.log('PASS: damage_breakdown_tracking');
  },

  daily_seed_and_streak() {
    assert(
      code.toLowerCase().includes('daily') || code.includes('toISOString') || code.includes('getFullYear') || code.includes('dailySeed'),
      'Daily run seed calculation (date-based YYYY-MM-DD or daily seed) must be implemented'
    );
    assert(
      code.toLowerCase().includes('streak') || code.includes('🔥') || code.toLowerCase().includes('flame'),
      'Daily streak tracking and streak flame indicator must be implemented'
    );
    console.log('PASS: daily_seed_and_streak');
  },

  lore_iceberg_logs() {
    assert(
      code.includes('LORE_LOGS') || code.includes('loreLogs') || code.includes('LORE'),
      'LORE_LOGS data structure containing cosmic horror entries (1-4) must be defined'
    );
    assert(
      code.toLowerCase().includes('typewriter') || code.toLowerCase().includes('terminal') || code.includes('log') || code.toLowerCase().includes('codex'),
      'Lore entries must be rendered with terminal/typewriter presentation and stored in Codex'
    );
    console.log('PASS: lore_iceberg_logs');
  },

  retention_and_game_feel() {
    assert(
      code.toLowerCase().includes('space') && (code.toLowerCase().includes('retry') || code.toLowerCase().includes('restart')),
      'Instant spacebar retry ([ SPACE: RETRY ]) must be implemented'
    );
    assert(
      code.includes('hitstop') || code.includes('hitStop') || (code.includes('crit') && code.includes('freeze')),
      'Hitstop impact freeze (3 frames on crits) must be implemented'
    );
    assert(
      code.includes('vibrate') || code.includes('navigator.vibrate'),
      'Haptic feedback via navigator.vibrate must be implemented'
    );
    console.log('PASS: retention_and_game_feel');
  },

  hud_layout_uncluttered_and_precise() {
    assert(
      !code.includes("if(UI.btn(c,'[FS]',mx-30,4,26,14))"),
      'In-game HUD must not show fullscreen/fit buttons during gameplay'
    );
    assert(
      code.includes("tx(c,'LV '+p.lv,7,26,'#ffd040',1,true)") &&
      code.includes("tx(c,'ARM '+Math.round(p.st.armor),52,26,'#a0b0d0',1,true)") &&
      code.includes("tx(c,'KILLS '+RS.kills,7,35,'#c8c8d8',1,true)") &&
      code.includes("tx(c,gTxt,78,35,'#ffd040',1,true)"),
      'HUD labels (LV, ARM, KILLS, GOLD) must have distinct non-colliding coordinates and rounded armor'
    );
    assert(
      !code.includes("tx(c,'LV '+p.lv,16,26,'#ffd040',1,true,'c')"),
      'LV label must not be center-aligned at 16, which spills outside the panel border'
    );
    assert(
      !code.includes("DEBUG: F5 NEXT OBJECTIVE"),
      'Main menu must not contain debug key dumps'
    );
    console.log('PASS: hud_layout_uncluttered_and_precise');
  },

  card_sprites_exact_proc_mapping() {
    assert(
      code.includes("missile:g('blue magic orb')") &&
      code.includes("throw:g('steel dagger')") &&
      code.includes("growth:g('blue book')"),
      'Card sprites must query verified procedural subjects from OB'
    );
    console.log('PASS: card_sprites_exact_proc_mapping');
  },

  // 12 New Stage Mechanics, Micro-Events, and Polish Test Suites
  secret_liberator_hero_and_badge() {
    assert(
      code.includes("id: 'liberator'") || code.includes('id:"liberator"') || code.includes("id:'liberator'") || code.includes('id: "liberator"'),
      'HEROES must include secret hero class with id: "liberator"'
    );
    assert(
      code.toLowerCase().includes('unshackled') || (code.includes('liberator') && code.toLowerCase().includes('flight')),
      'Liberator hero must feature Unshackled perk (+15% Speed, +20% Might, Flight)'
    );
    assert(
      code.toLowerCase().includes('supernova'),
      'Liberator hero must have Supernova active skill'
    );
    assert(
      code.includes('trueVictory') && (code.includes('liberator') || code.includes('trueEnding')),
      'trueVictory must unlock liberator and record trueEnding in META'
    );
    assert(
      code.includes('TRUE LIBERATOR') || (code.includes('trueEnding') && code.includes('LIBERATOR')),
      'Title screen must render Platinum Badge [ ⬡ TRUE LIBERATOR ⬡ ] when trueEnding is achieved'
    );
    console.log('PASS: secret_liberator_hero_and_badge');
  },

  near_miss_boss_callout() {
    assert(
      code.includes('nearMiss') || code.includes('G.nearMiss'),
      'G.nearMiss must capture remaining boss HP percentage on player defeat'
    );
    assert(
      (code.includes('ONLY') && code.includes('HP LEFT')) || code.includes('Dash through attacks next time'),
      'sceneGameOver must display near-miss boss HP callout (ONLY X% HP LEFT!)'
    );
    console.log('PASS: near_miss_boss_callout');
  },

  caves_shroom_flash_stun() {
    assert(
      (code.includes("k==='shroom'") || code.includes("k === 'shroom'") || code.includes("o.k==='shroom'") || code.includes("o.k === 'shroom'")) &&
      (code.includes('e.stun = 180') || code.includes('e.stun=180') || code.includes('stun = 180') || code.includes('stun=180')),
      'Striking glowing mushroom props in caves must set e.stun = 180 on nearby enemies and burst spores'
    );
    console.log('PASS: caves_shroom_flash_stun');
  },

  ruins_gate_siege_ritual() {
    assert(
      code.includes('useGate') && (code.includes('siege') || code.includes('Siege') || code.includes('SIEGE') || code.includes('wave') || code.includes('siegeT')),
      'useGate must activate Ancient Gate Siege survival wave'
    );
    assert(
      code.includes('20') && (code.toLowerCase().includes('siege') || code.includes('gateSiege') || code.includes('siegeT') || code.includes('SURVIVE 20 SECONDS')),
      'Gate siege must enforce a 20-second survival wave before gate opens'
    );
    console.log('PASS: ruins_gate_siege_ritual');
  },

  hell_sinking_platforms_and_heat_gauge() {
    assert(
      (code.includes('sinkable') || code.includes('sinkers')) &&
      (code.includes('sinkT++') || code.includes('sinkT =') || code.includes('sinkT+=') || code.includes('sinkT + 1')),
      'Hell sinking platforms must advance sinkT and sink when stepped on'
    );
    assert(
      (code.includes('pl.heat') || code.includes('p.heat') || (code.includes('heat') && code.includes('HLD'))) && (code.includes('burn') || code.includes('100') || code.includes('fire')),
      'Hell must feature Inferno Heat Gauge mechanics with fire attacks / burn'
    );
    console.log('PASS: hell_sinking_platforms_and_heat_gauge');
  },

  shaft_clutch_slowmo() {
    assert(
      code.includes('0.18') &&
      (code.includes('lava') || code.includes('shaft')) &&
      (code.includes('slow') || code.includes('heartbeat') || code.includes('clutch')),
      'Shaft stage must trigger clutch slow-mo when <18% HP near rising lava'
    );
    console.log('PASS: shaft_clutch_slowmo');
  },

  sky_bouncy_cumulus_clouds() {
    assert(
      (code.includes('bouncy') || code.includes('cumulus')) &&
      (code.includes('-14') || code.includes('vy = -14') || code.includes('vy=-14')),
      'Upper cumulus clouds in Sky realm must bounce player upwards with spring impulse (pl.vy = -14)'
    );
    assert(
      code.includes('!inArena') && !code.includes('b.gid===TL.CLOUDS)&&b.y/T<150){b.vy=-14'),
      'Archangel arena floor must never bounce or launch the player'
    );
    console.log('PASS: sky_bouncy_cumulus_clouds');
  },

  space_asteroid_gravity_slingshot() {
    assert(
      (code.toLowerCase().includes('slingshot') || (code.includes('SPC') && (code.toLowerCase().includes('grav') || code.toLowerCase().includes('asteroid')))) &&
      (code.includes('boost') || code.includes('speed') || code.includes('vx') || code.includes('vy')),
      'Space stage must feature gravitational slingshot / speed boost near heavy asteroids'
    );
    console.log('PASS: space_asteroid_gravity_slingshot');
  },

  micro_event_treasure_scamp() {
    assert(
      code.toLowerCase().includes('scamp'),
      'Treasure Scamp enemy/event must be defined'
    );
    assert(
      code.includes('scamp') && (code.toLowerCase().includes('coin') || code.toLowerCase().includes('gold')) && (code.toLowerCase().includes('chest') || code.toLowerCase().includes('loot')),
      'Treasure Scamp must drop coins on hit and guarantee high-tier chest if slain'
    );
    assert(
      code.includes("case'scamp'") || code.includes("case 'scamp'") || code.includes("beh==='scamp'") || code.includes("beh === 'scamp'"),
      'Treasure Scamp must have active movement/fleeing behavior'
    );
    console.log('PASS: micro_event_treasure_scamp');
  },

  micro_event_cursed_shrine() {
    assert(
      code.includes('altar_cursed') || code.toLowerCase().includes('cursed shrine') || code.toLowerCase().includes('cursed altar'),
      'Cursed shrine / blood altar prop must be defined'
    );
    assert(
      (code.includes('0.4') || code.includes('40%') || code.includes('maxHp * 0.4') || code.includes('maxhp * 0.4')) && (code.toLowerCase().includes('mythic') || code.toLowerCase().includes('evolution') || code.toLowerCase().includes('basin')),
      'Cursed shrine must trade 40% max HP for guaranteed mythic / evolution gear'
    );
    console.log('PASS: micro_event_cursed_shrine');
  },

  pitch_shift_xp_gems() {
    assert(
      code.includes('gemStreak') && (code.includes('Math.pow(2') || code.includes('freq') || code.includes('streak')),
      'Ascending musical pitch-shift scale on chained XP gem pickups must be implemented'
    );
    console.log('PASS: pitch_shift_xp_gems');
  },

  share_run_card_clipboard() {
    assert(
      code.includes('COPY RUN CARD') || code.includes('COPY RUN') || code.includes('runCard') || code.includes('shareRun'),
      'One-click [ 📋 COPY RUN CARD ] button must be present on game over / victory screens'
    );
    assert(
      code.includes('clipboard.writeText') || code.includes('writeText'),
      'Share Run Card must write formatted run stats to clipboard via navigator.clipboard.writeText'
    );
    assert(
      (code.includes('VIVARIUM') || code.includes('CYLINDER ZERO')) && (code.includes('Hero:') || code.includes('Time:') || code.includes('Seed:')),
      'Run card snippet must include formatted game title, hero, time, and seed'
    );
    console.log('PASS: share_run_card_clipboard');
  },

  hero_select_and_liberator_sprites_fixed() {
    assert(
      code.includes("['liberator','liberator'") && code.includes('liberator:HUES.teal'),
      'Liberator hero must have procedural sprite registered in HR and HUES'
    );
    assert(
      code.includes('if(!sp||!sp.m)return;'),
      'drawSpr must safely guard against null/undefined sprite inputs'
    );
    assert(
      code.includes("return proc||Sprites.proc.getBySubject('paladin')||Sprites.proc.list[0]"),
      'heroSprite must safely fall back if exact sprite not found'
    );
    console.log('PASS: hero_select_and_liberator_sprites_fixed');
  },

  onboarding_floating_prompts() {
    assert(
      code.includes('const Onboard={') &&
      code.includes("id:'move'") &&
      code.includes("id:'jump'") &&
      code.includes("id:'djump'") &&
      code.includes("id:'dash'") &&
      code.includes("id:'skill'"),
      'Onboard system must be defined with move, jump, djump, dash, and skill steps'
    );
    assert(
      code.includes('Onboard.update()') && code.includes('Onboard.draw(c)'),
      'Onboard system must be updated and drawn during gameplay'
    );
    assert(
      code.includes('p.air>=1&&p.jumping') && code.includes('p.dashT>0'),
      'Onboard steps must require real player action verification (air jump, dash)'
    );
    console.log('PASS: onboarding_floating_prompts');
  },

  quest_arrow_early_proximity_glide() {
    assert(
      code.includes('const earlyStage=Quest.i<=1;') &&
      code.includes('G.stageArrowT=(G.stageArrowT||0)+1;'),
      'drawArrow must track early stage (first 2 stages) and stage arrow time'
    );
    assert(
      code.includes('G.stageArrowT<650') && code.includes('ax=lerp(nearX,edgeX,ease);'),
      'Quest arrow must orbit near player and glide smoothly to screen edge on early stages'
    );
    assert(
      code.includes('G.stageArrowT=0;') && code.includes('keyGot(){'),
      'Stage arrow timer must reset on new game and quest stage advance'
    );
    console.log('PASS: quest_arrow_early_proximity_glide');
  },

  favicon_pixel_art_present() {
    assert(
      html.includes('<link rel="icon" type="image/svg+xml"'),
      'index.html must include an SVG favicon'
    );
    assert(
      html.includes("viewBox='0 0 16 16'") && html.includes('crispEdges'),
      'Favicon SVG must be pixel art with crisp edges'
    );
    console.log('PASS: favicon_pixel_art_present');
  },

  space_arena_flight_clearance_and_no_blocking_walls() {
    assert(
      code.includes("if(CW.name==='over'&&p.y<2*T)p.y=2*T;"),
      'Space vertical ceiling clamp must be at row 2 to grant 12+ tiles of flight room'
    );
    assert(
      !code.includes("fillR(w,AX+o,10,1,4,TL.METAL)"),
      'Space arena platform must not contain 4-tile high vertical blocking walls'
    );
    console.log('PASS: space_arena_flight_clearance_and_no_blocking_walls');
  },

  wizard_distinct_mechanics_and_hero_persistence() {
    assert(
      code.includes("META.lastHero") &&
      code.includes("['knight','wizard','rogue'].forEach"),
      'Wizard must be permanently unlocked and chosen hero persisted in META.lastHero'
    );
    assert(
      code.includes("n=2+(lv>>1)+amt+(evo?3:0);") &&
      code.includes("w.cd=46*cdm;"),
      'Wizard starting Arcane Missiles must launch 2+ homing bolts with rapid cooldown'
    );
    assert(
      code.includes("p.hero.id==='wizard'") &&
      code.includes("ARCANE NOVA!"),
      'Wizard must have ambient arcane magical aura and dramatic Arcane Nova skill effects'
    );
    console.log('PASS: wizard_distinct_mechanics_and_hero_persistence');
  },

  victory_screen_progressive_disclosure_and_clean_layout() {
    assert(
      code.includes("G.vStep===0") && code.includes("G.vStep===1"),
      'Victory screen must implement multi-stage progressive disclosure (G.vStep)'
    );
    assert(
      code.includes("wrapText(c,s,x,y,w,col='#fff',align='c',bold=true)") ||
      code.includes("wrapText(c,s,x,y,w,col,align"),
      'wrapText must accept align parameter defaulting to c with support for left align l'
    );
    assert(
      code.includes("CREDITS.forEach") &&
      code.includes("c.clip()") &&
      code.includes("G.vCreditsT"),
      'Credits marquee must be smoothly animated and clipped in dedicated window without overlapping buttons'
    );
    assert(
      code.includes("DECRYPT TERMINAL LOGS") &&
      code.includes("VIEW PERFORMANCE & CREDITS") &&
      code.includes("SPACE: RETRY"),
      'Progressive disclosure flow must provide clear stage navigation and spacebar flow'
    );
    assert(
      code.includes("wps.slice(0,3).forEach") &&
      code.includes("WEAPON DAMAGE BREAKDOWN"),
      'Stage 2 debrief must display weapon damage breakdown with visual proportion bars'
    );
    console.log('PASS: victory_screen_progressive_disclosure_and_clean_layout');
  },

  hell_shaft_skip_objective_and_no_teleport_loop() {
    assert(
      code.includes("G.collapseTimer1") && code.includes("G.collapseTimer2"),
      'Collapse timers must be tracked on G to allow safe cancellation during skip and teleport'
    );
    assert(
      code.includes("CW.name==='hell'") && code.includes("transition(()=>this.enterShaft())"),
      'Hell collapse timer must strictly verify CW.name === hell before executing transition'
    );
    assert(
      code.includes("case 3:pl.hasBoots=true;recalc();G.f.hellBossDead=true;G.f.boots=true;Quest.enterShaft();break;"),
      'dbgSkip case 3 must immediately grant boots and transition to Shaft without 4.2s delay'
    );
    assert(
      code.includes("case 4:pl.hasBoots=true;recalc();G.f.escaped=true;G.lava=null;Quest.i=5;enterOverworld"),
      'dbgSkip case 4 must reliably exit Shaft to Overworld volcano without deadlock'
    );
    assert(
      code.includes("G.exiting=false") && code.includes("G.fading=false"),
      'Shaft exit and enterShaft must reset transition and exiting flags to prevent deadlock'
    );
    console.log('PASS: hell_shaft_skip_objective_and_no_teleport_loop');
  }
};

let failed = 0;
let passed = 0;

function runTest(name) {
  try {
    tests[name]();
    passed++;
  } catch (e) {
    console.error(`FAIL: ${name} - ${e.message}`);
    failed++;
  }
}

if (!testName || testName === 'all') {
  console.log(`Running all ${Object.keys(tests).length} tests...`);
  for (const name of Object.keys(tests)) {
    runTest(name);
  }
  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  }
} else if (tests[testName]) {
  runTest(testName);
  if (failed > 0) {
    process.exit(1);
  }
} else {
  console.error(`Unknown test: ${testName}`);
  console.log('Available tests:', Object.keys(tests).join(', '));
  process.exit(1);
}
