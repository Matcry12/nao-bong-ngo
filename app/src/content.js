export const content = {
  start: {
    title: 'Não bỏng ngô',
    sub: 'Chơi 4 trò nhỏ để xem não bạn có đang “nổ” vì điện thoại không.',
    cta: 'BẮT ĐẦU',
    disclaimer: 'Trò chơi tự đánh giá, không phải chẩn đoán y khoa.',
  },
  common: { close: 'Đóng', progress: 'Tiến độ', next: 'TIẾP TỤC', check: 'KIỂM TRA' },
  intros: [
    { tag: 'TRÒ 1/4 · ĐỌC', title: 'Đọc đoạn văn, đừng để thông báo làm phiền!', cta: 'SẴN SÀNG' },
    { tag: 'TRÒ 2/4 · KIÊN NHẪN', title: 'Chờ chấm chuyển xanh rồi mới bấm nhé.', cta: 'SẴN SÀNG' },
    { tag: 'TRÒ 3/4 · NGỒI YÊN', title: 'Ngắm cảnh yên bình. Muốn bỏ qua thì cứ bấm.', cta: 'SẴN SÀNG' },
    { tag: 'TRÒ 4/4 · ĐẶT MÁY XUỐNG', title: 'Điện thoại sẽ rung. Đừng chạm vào nhé!', cta: 'SẴN SÀNG' },
  ],
  patience: {
    tag: 'TRÒ 2/4 · KIÊN NHẪN',
    wait: 'Chờ chấm chuyển xanh rồi bấm.',
    go: 'Bây giờ! Bấm đi!',
    dotLabel: 'Chấm tròn',
    giveUp: 'BỎ CUỘC',
  },
  skip: {
    tag: 'TRÒ 3/4 · NGỒI YÊN',
    title: 'Ngắm cảnh này một lát. Muốn bỏ qua thì cứ bấm.',
    breathe: 'Hít vào… thở ra…',
    sceneLabel: 'Cảnh đồi xanh và mặt trời, mây trôi chậm',
    timeLeft: 'Còn lại',
    skip: 'BỎ QUA',
  },
  phone: {
    tag: 'TRÒ 4/4 · ĐẶT MÁY XUỐNG',
    title: 'Đừng chạm vào!',
    sub: 'Đừng chạm vào máy cho tới khi hết giờ.',
    touches: 'Số lần chạm',
    phoneLabel: 'Điện thoại đang rung',
  },
  self: {
    tag: 'TỰ ĐÁNH GIÁ',
    choices: ['Không bao giờ', 'Hiếm khi', 'Thỉnh thoảng', 'Thường xuyên', 'Rất thường xuyên'],
    items: [
      'Khi học, bạn kiểm tra điện thoại dù không cần thiết.',
      'Bạn chuyển liên tục giữa các ứng dụng/nội dung trong thời gian ngắn.',
      'Bạn thấy khó chịu, mất kiên nhẫn khi đọc văn bản dài.',
      'Bạn xem video ngắn hơn 2 giờ mỗi ngày.',
      'Việc dùng điện thoại khiến bạn trì hoãn việc học.',
    ],
  },
  read: {
    title: 'Bài tối nay của Mai',
    paragraphs: [
      'Tối nay Mai phải học xong bài Sinh học cho buổi kiểm tra ngày mai. Em đặt sách lên bàn, mở vở ghi và bắt đầu đọc về quá trình quang hợp.',
      'Chưa đọc hết một đoạn thì điện thoại rung lên. Là tin nhắn từ nhóm lớp, mọi người đang bàn về một đoạn video vui. Mai liếc nhanh, định chỉ xem một giây thôi.',
      'Nhưng một giây biến thành mười phút. Khi quay lại với quyển sách, em quên mất mình đã đọc đến đâu và phải đọc lại từ đầu. Mai thở dài, úp điện thoại xuống bàn rồi đọc tiếp.',
    ],
    done: 'XONG RỒI',
    videoTitle: 'Đang xem video...',
    videoSub: 'Mất mấy giây rồi đó!',
    questions: [
      {
        q: 'Mai đang học bài môn gì?',
        options: ['Sinh học', 'Lịch sử', 'Địa lý'],
        correct: 0,
        right: 'Chính xác! Bạn vẫn tập trung tốt.',
        wrong: 'Chưa đúng, không sao!',
        answer: 'Đáp án: Sinh học.',
      },
      {
        q: 'Điều gì làm Mai bị phân tâm?',
        options: ['Tiếng ồn ngoài đường', 'Tin nhắn từ nhóm lớp', 'Tiếng chuông báo thức'],
        correct: 1,
        right: 'Chính xác! Bạn vẫn tập trung tốt.',
        wrong: 'Chưa đúng, không sao!',
        answer: 'Đáp án: tin nhắn từ nhóm lớp.',
      },
      {
        q: 'Sau khi xem điện thoại, Mai phải làm gì?',
        options: ['Đi ngủ sớm', 'Đọc lại từ đầu', 'Nhờ bạn giảng bài'],
        correct: 1,
        right: 'Chính xác! Bạn vẫn tập trung tốt.',
        wrong: 'Chưa đúng, không sao!',
        answer: 'Đáp án: đọc lại từ đầu.',
      },
    ],
    notifications: [
      { at: 8, who: 'Nhóm lớp', time: 'vừa xong', text: 'Ê mọi người ơi, xem cái này đi!! (3 tin mới)' },
      { at: 18, who: 'Bạn thân', time: 'vừa xong', text: 'Ơi, tối nay rảnh không? Nhắn mình nhanh nha!' },
      { at: 30, who: 'Tin nóng', time: 'vừa xong', text: 'Video này đang được xem nhiều nhất hôm nay' },
      { at: 45, who: 'Trò chơi', time: 'vừa xong', text: 'Phần thưởng của bạn sắp hết hạn, nhận ngay!' },
    ],
  },
  result: {
    eyebrow: 'KẾT QUẢ',
    youAre: 'BẠN LÀ',
    scoreLabel: 'Điểm “nổ”',
    levelLabel: 'Mức độ',
    next: 'TIẾP TỤC',
    levels: {
      low: { persona: 'Hạt Bắp Bình Tĩnh', line: 'Não bạn khá vững, thông báo khó làm bạn xao nhãng.' },
      medium: { persona: 'Bắp Đang Nóng Dần', line: 'Bạn vẫn tập trung được, nhưng điện thoại hay kéo bạn đi.' },
      high: { persona: 'Bắp Rang Nổ Liên Tục', line: 'Não bạn đang “nổ” khá nhiều! Mình cùng hạ nhiệt nhé.' },
    },
  },
  result2: {
    eyebrow: 'KẾT QUẢ 2/2',
    back: 'Quay lại',
    title: '4 chỉ số của bạn',
    caption: 'Thanh càng dài = càng “nổ” như bắp rang.',
    bars: {
      focus: 'Tập trung khi bị xao nhãng',
      patience: 'Kiên nhẫn',
      switchUrge: 'Muốn chuyển nội dung',
      phone: 'Gắn bó với điện thoại',
    },
    survey: {
      phone: '60–65% học sinh trong khảo sát 450 bạn cũng thường kiểm tra điện thoại khi học.',
      patience: '153/450 học sinh trong khảo sát cũng hay mệt mỏi, thiếu kiên nhẫn.',
      switchUrge: '157/450 học sinh khó tập trung quá 15 phút nếu bài giảng không sinh động.',
      focus: 'Khó tập trung khi học kéo dài: 50% nam và 60% nữ trong khảo sát.',
    },
    disclaimer: 'Đây không phải chẩn đoán y khoa.',
    replay: 'CHƠI LẠI',
    toLevel2: 'SANG MÀN 2',
  },
}

export const REASON_LABELS = {
  content: 'Nội dung quá cuốn',
  habit: 'Thói quen',
  fomo: 'Sợ bỏ lỡ (FOMO)',
  friends: 'Bạn bè đều dùng',
  stress: 'Giải tỏa căng thẳng',
  selfControl: 'Khó tự kiểm soát',
}

export const REASON_INFO = {
  content: 'Video và nội dung được chọn riêng cho bạn nên rất khó dừng lại.',
  habit: 'Tay tự cầm máy lên, nhiều khi bạn còn chưa kịp nghĩ.',
  fomo: 'Bạn lo mình bỏ lỡ tin nhắn hay chuyện vui của mọi người.',
  friends: 'Cả nhóm cùng lướt nên bạn cũng dễ lướt theo.',
  stress: 'Lướt điện thoại là cách bạn thư giãn sau những lúc mệt hay buồn.',
  selfControl: 'Bạn biết nên dừng nhưng thường lướt lâu hơn dự định.',
}

export const GROUP_LABELS = { self: 'Bản thân', family: 'Gia đình', friends: 'Bạn bè', school: 'Nhà trường' }

export const level2 = {
  intro: { tag: 'MÀN 2 · VÌ SAO BẠN HAY LƯỚT?', title: 'Không có đúng sai. Chọn điều bạn thường làm nhất.', cta: 'SẴN SÀNG' },
  scenario: { tag: 'Tình huống', aria: 'Tình huống', next: 'TIẾP TỤC' },
  plan: {
    title: 'Kế hoạch của bạn',
    main: 'Lý do chính:',
    second: 'Lý do thứ hai:',
    save: 'LƯU KẾ HOẠCH',
    ask: 'HỎI HẠT BẮP',
  },
  celebrate: { title: 'Kế hoạch đã sẵn sàng!', sub: 'Mỗi ngày một việc nhỏ, bạn làm được.', cta: 'CHƠI LẠI' },
}

export const scenarios = [
  {
    id: 'buzz', icon: 'phone', title: 'Điện thoại rung',
    text: 'Đang học bài thì điện thoại rung lên. Bạn sẽ…',
    choices: [
      { text: 'Xem ngay, sợ có chuyện gì quan trọng', w: { fomo: 2 } },
      { text: 'Cầm lên theo phản xạ, chẳng nghĩ gì', w: { habit: 2 } },
      { text: 'Úp máy xuống, học tiếp', w: {} },
      { text: 'Xem một chút rồi lướt mãi không dừng', w: { content: 1, selfControl: 2 } },
    ],
  },
  {
    id: 'group', icon: 'group', title: 'Học nhóm',
    text: 'Học nhóm với bạn, ai cũng có điện thoại trên bàn. Bạn sẽ…',
    choices: [
      { text: 'Lướt theo, vì cả nhóm đang lướt', w: { friends: 2 } },
      { text: 'Cùng cất máy vào túi, học xong mới xem', w: {} },
      { text: 'Lướt một chút cho đỡ căng thẳng giữa giờ', w: { stress: 1, habit: 1 } },
      { text: 'Liếc nhóm chat, sợ bỏ lỡ tin mới', w: { fomo: 1, friends: 1 } },
    ],
  },
  {
    id: 'dinner', icon: 'dinner', title: 'Bữa cơm tối',
    text: 'Bữa cơm tối cùng gia đình, điện thoại để ngay cạnh bát. Bạn sẽ…',
    choices: [
      { text: 'Vừa ăn vừa xem video, ăn xong lúc nào không hay', w: { content: 2, habit: 1 } },
      { text: 'Thỉnh thoảng lại liếc xem máy', w: { habit: 2 } },
      { text: 'Nhắn tin với bạn, sợ lỡ chuyện vui', w: { fomo: 1, friends: 1 } },
      { text: 'Cất máy đi, trò chuyện với cả nhà', w: {} },
    ],
  },
  {
    id: 'bored', icon: 'moon', title: 'Buồn chán 10 giờ tối',
    text: 'Đã 10 giờ tối, bạn thấy buồn chán và chưa buồn ngủ. Bạn sẽ…',
    choices: [
      { text: 'Nghe nhạc hoặc đọc vài trang sách', w: {} },
      { text: 'Mở video ngắn, xem cho đã', w: { content: 2 } },
      { text: 'Lướt cho quên bớt mệt mỏi trong ngày', w: { stress: 2 } },
      { text: 'Lướt hoài, muốn dừng mà không dừng được', w: { selfControl: 2 } },
    ],
  },
  {
    id: 'badtest', icon: 'paper', title: 'Điểm kiểm tra kém',
    text: 'Bạn vừa nhận điểm kiểm tra kém hơn mong đợi. Bạn sẽ…',
    choices: [
      { text: 'Lướt mạng cho bớt buồn', w: { stress: 2 } },
      { text: 'Nhắn bạn bè xem mọi người được mấy điểm', w: { friends: 1, fomo: 1 } },
      { text: 'Xem video hài để quên chuyện này', w: { content: 1, stress: 1 } },
      { text: 'Đi dạo một lát, rồi nói chuyện với bố mẹ hoặc thầy cô', w: {} },
    ],
  },
  {
    id: 'trend', icon: 'spark', title: 'Trend mới',
    text: 'Cả lớp đang bàn về một trend mới. Bạn sẽ…',
    choices: [
      { text: 'Xem ngay để không bị lạc lõng', w: { fomo: 2, friends: 1 } },
      { text: 'Thử trend đó cùng bạn bè', w: { friends: 2 } },
      { text: 'Xem sơ qua rồi quay lại việc của mình', w: {} },
      { text: 'Xem hết các video về trend đó, hay quá', w: { content: 2 } },
    ],
  },
  {
    id: 'sleep', icon: 'bed', title: 'Trước khi ngủ',
    text: 'Đã đến giờ đi ngủ, điện thoại vẫn trong tay. Bạn sẽ…',
    choices: [
      { text: 'Đặt máy ra xa, tắt đèn đi ngủ', w: {} },
      { text: 'Lướt thêm chút, ngủ muộn lúc nào không hay', w: { selfControl: 2, content: 1 } },
      { text: 'Cầm máy lên như mọi tối, quen rồi', w: { habit: 2 } },
      { text: 'Kiểm tra lần cuối xem có tin gì không', w: { fomo: 1, habit: 1 } },
    ],
  },
  {
    id: 'weekend', icon: 'sun', title: 'Cuối tuần rảnh rỗi',
    text: 'Cuối tuần rảnh rỗi, chưa có kế hoạch gì. Bạn sẽ…',
    choices: [
      { text: 'Nằm xem video cả buổi', w: { content: 2, selfControl: 1 } },
      { text: 'Mở máy lúc nào không hay, hết cả buổi sáng', w: { habit: 2, selfControl: 1 } },
      { text: 'Nhắn nhóm bạn cả ngày, sợ không theo kịp chuyện chung', w: { friends: 1, fomo: 1 } },
      { text: 'Rủ bạn đá cầu, đạp xe', w: {} },
    ],
  },
]

export const SOLUTIONS = {
  notifOff: { group: 'self', title: 'Tắt thông báo khi học', detail: 'Không có tiếng rung thì bạn đỡ bị kéo ra khỏi bài.', task7: 'Tắt thông báo các app trong lúc học tối nay.' },
  phoneFar: { group: 'self', title: 'Để điện thoại xa bàn học', detail: 'Máy ở xa tầm tay thì khó với tới hơn nhiều.', task7: 'Để điện thoại cách bàn học 2 mét trong 30 phút.' },
  limitGradual: { group: 'self', title: 'Giảm dần thời gian dùng', detail: 'Hạ từ 2 giờ xuống 1 giờ 30 mỗi ngày, rồi giảm tiếp khi đã quen.', task7: 'Hôm nay dùng điện thoại giải trí tối đa 1 giờ 30.' },
  fixedChecks: { group: 'self', title: 'Chỉ xem tin vào giờ cố định', detail: 'Chọn 3 lần xem tin trong ngày, các lúc khác cứ yên tâm bỏ qua.', task7: 'Chỉ xem tin nhắn lúc 12 giờ, 5 giờ và 9 giờ.' },
  focus25: { group: 'self', title: 'Học 25 phút, nghỉ 5 phút', detail: 'Giờ nghỉ là lúc bạn được xem tin nhắn, nên học sẽ dễ tập trung hơn.', task7: 'Học đúng 1 lượt 25 phút, nghỉ 5 phút.' },
  readPage: { group: 'self', title: 'Mỗi ngày đọc 1 trang sách giấy', detail: 'Đọc chậm một trang giúp bạn quen lại với việc tập trung lâu.', task7: 'Đọc 1 trang sách giấy, không cầm điện thoại.' },
  roleModel: { group: 'family', title: 'Bố mẹ làm gương', detail: 'Cả nhà cùng giảm dùng điện thoại thì bạn sẽ dễ làm theo hơn.', task7: 'Nhờ bố mẹ cùng để máy xa tầm tay 30 phút buổi tối.' },
  familyDinner: { group: 'family', title: 'Bữa cơm không điện thoại', detail: 'Cất máy khi ăn cơm, cả nhà có thêm thời gian trò chuyện.', task7: 'Cất điện thoại trong cả bữa cơm tối nay.' },
  studyBag: { group: 'friends', title: 'Học nhóm, cất máy vào túi', detail: 'Cả nhóm cất máy, ai cầm lên trước thì mời mọi người một ly trà sữa.', task7: 'Rủ bạn học nhóm 30 phút với điện thoại trong túi.' },
  weekendSport: { group: 'friends', title: 'Cuối tuần chơi thể thao cùng bạn', detail: 'Ra ngoài vận động cùng bạn vui hơn và cũng giải tỏa căng thẳng.', task7: 'Rủ một bạn đi dạo hoặc chơi thể thao 30 phút.' },
  weeklyGoal: { group: 'friends', title: 'Cả nhóm đặt mục tiêu mỗi tuần', detail: 'Cùng nhau đặt mức dùng điện thoại và nhắc nhau, cuối tuần kể xem ai làm được.', task7: 'Nhắn nhóm bạn mục tiêu thời gian dùng máy của tuần này.' },
  classBox: { group: 'school', title: 'Hộp để điện thoại trong lớp', detail: 'Cả lớp gửi máy vào hộp đầu giờ, học xong mới lấy lại.', task7: 'Hôm nay cất điện thoại trong cặp suốt giờ học.' },
  presentations: { group: 'school', title: 'Thuyết trình nhóm trên lớp', detail: 'Làm việc nhóm giúp bạn có lý do để rời màn hình và trò chuyện thật.', task7: 'Cùng bạn bàn một ý tưởng bài thuyết trình, không dùng điện thoại.' },
  clubs: { group: 'school', title: 'Tham gia câu lạc bộ ở trường', detail: 'Có việc thú vị để làm cùng bạn bè thì điện thoại bớt hấp dẫn.', task7: 'Tìm hiểu một câu lạc bộ ở trường bạn muốn thử.' },
}

export const reasonSolutions = {
  content: ['limitGradual', 'weekendSport', 'readPage', 'clubs'],
  habit: ['notifOff', 'phoneFar', 'classBox', 'fixedChecks'],
  fomo: ['notifOff', 'fixedChecks', 'studyBag', 'weeklyGoal'],
  friends: ['studyBag', 'weeklyGoal', 'weekendSport', 'presentations'],
  stress: ['weekendSport', 'familyDinner', 'clubs', 'presentations'],
  selfControl: ['limitGradual', 'roleModel', 'weeklyGoal', 'phoneFar'],
}

export const barSolutions = { focus: 'focus25', patience: 'readPage', switchUrge: 'fixedChecks', phone: 'phoneFar' }

const CHIP_TIME = 'Mình hay học buổi tối thì sao?'
const CHIP_NOTIF = 'Tắt thông báo khó quá!'
const CHIP_SCORE = 'Giải thích điểm của mình'

export const coach = {
  name: 'Hạt Bắp',
  subtitle: 'Bạn đồng hành của bạn',
  close: 'Quay lại kế hoạch',
  placeholder: 'Nhắn cho Hạt Bắp…',
  send: 'Gửi',
  typing: 'Hạt Bắp đang gõ',
  note: 'Hạt Bắp là AI, có thể sai. Thông tin gửi đi ẩn danh.',
  chips: [CHIP_TIME, CHIP_NOTIF, CHIP_SCORE],
  remaining: (n) => `Hôm nay bạn còn ${n} tin nhắn.`,
  limitReached: 'Hôm nay bạn đã hỏi đủ 20 tin rồi. Mai mình trò chuyện tiếp nhé! Giờ bạn thử một việc nhỏ trong kế hoạch xem sao.',
  openingPrompt: 'Hãy giải thích ngắn gọn kết quả của mình và gợi ý việc đầu tiên nên làm.',
  hotline: { label: 'Gọi 111 (miễn phí, 24/7)', href: 'tel:111' },
  crisis: [
    'Mình rất tiếc khi nghe bạn đang thấy nặng nề như vậy. Bạn không phải một mình đâu.',
    'Bạn hãy nói chuyện ngay với một người lớn bạn tin, như bố mẹ, thầy cô hoặc cán bộ tư vấn ở trường nhé. Nếu cần, gọi 111 (Tổng đài quốc gia bảo vệ trẻ em, miễn phí 24/7).',
    'Khi bạn thấy ổn hơn, mình vẫn ở đây để cùng bạn tập trung học và dùng điện thoại nhẹ nhàng hơn.',
  ],
  fallback: {
    opening: ({ score, level, reasons, plan }) => {
      const out = []
      if (typeof score === 'number') {
        out.push(`Điểm “nổ” của bạn là ${Math.round(score)}/100${level ? `, mức ${level.toLowerCase()}` : ''}. Đây chỉ là cách gọi vui, không phải chẩn đoán. Ai cũng có lúc bị điện thoại kéo đi!`)
      } else {
        out.push('Chào bạn, mình là Hạt Bắp! Mình ở đây để cùng bạn tập trung hơn.')
      }
      if (reasons?.length) out.push(`Lý do chính của bạn là: ${reasons[0].toLowerCase()}. Việc nhỏ đầu tiên: ${plan?.[0]?.title ? plan[0].title.toLowerCase() : 'đặt điện thoại xa bàn học 30 phút'}.`)
      return out
    },
    replies: {
      [CHIP_TIME]: 'Buổi tối là lúc tin nhắn và video hay “réo” nhất. Thử học 25 phút rồi nghỉ 5 phút, để điện thoại ở xa bàn và chỉ xem tin trong giờ nghỉ. Làm được vài tối là quen dần đó!',
      [CHIP_NOTIF]: 'Khó là chuyện bình thường! Bạn đừng tắt hết một lần. Hôm nay chỉ tắt thông báo của 1 ứng dụng hay làm bạn xao nhãng nhất, trong lúc học thôi. Quen rồi mình tắt thêm nhé.',
      [CHIP_SCORE]: 'Điểm càng cao nghĩa là bạn càng dễ bị điện thoại làm xao nhãng khi học. Bốn thanh chỉ số cho thấy bạn “nổ” nhiều ở đâu, và kế hoạch của bạn nhắm đúng vào chỗ đó. Bắt đầu từ một việc nhỏ là đủ rồi!',
    },
    generic: 'Mình đang ngoại tuyến nên chưa trả lời kỹ được. Bạn thử một việc nhỏ trong kế hoạch hôm nay nhé: để điện thoại xa bàn học 30 phút. Hoặc bấm một câu hỏi gợi ý ở trên!',
  },
}
