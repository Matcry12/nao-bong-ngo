export const content = {
  start: {
    title: 'Não bỏng ngô',
    sub: 'Chơi 4 trò nhỏ để xem não bạn có đang “nổ” vì điện thoại không.',
    cta: 'BẮT ĐẦU',
    disclaimer: 'Trò chơi tự đánh giá, không phải chẩn đoán y khoa.',
  },
  common: { close: 'Đóng', progress: 'Tiến độ', next: 'TIẾP TỤC', check: 'KIỂM TRA' },
  intro1: {
    tag: 'TRÒ 1/4 · ĐỌC',
    title: 'Đọc đoạn văn, đừng để thông báo làm phiền!',
    cta: 'SẴN SÀNG',
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
    replay: 'CHƠI LẠI',
    levels: {
      low: { persona: 'Bắp Bình Tĩnh', line: 'Não bạn khá vững, thông báo khó làm bạn xao nhãng.' },
      medium: { persona: 'Bắp Lăn Tăn', line: 'Bạn tập trung được, nhưng thông báo hay kéo bạn đi.' },
      high: { persona: 'Bắp Nổ Tung', line: 'Não bạn đang hơi “nổ” nhiều đó! Mình cùng hạ nhiệt nhé.' },
    },
  },
}
