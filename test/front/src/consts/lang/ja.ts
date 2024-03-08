const ja =  {
  PAGES: {
    LOGIN: {
      TITLE: 'ログイン',
    },
    HOME: {
      TITLE: 'Wallet ホーム',
      MENU_ADD_ACCOUNT: 'アカウント作成',
      MENU_VC_APPLICATION: 'デジタル証明申請',
      MENU_APPLICATION_LIST: 'デジタル証明申請一覧',
      MENU_VC_LIST: 'デジタル証明一覧',
    },
    CREATE_ACCOUNT: {
      TITLE: 'アカウント作成',
      PERSONAL_ACCOUNT: '個人アカウント',
      MENU_PERSONAL_ACCOUNT_CREATE: '個人アカウント作成',
      GROUP_ACCOUNT: 'グループアカウント',
      MENU_GROUP_ACCOUNT_CREATE: 'グループアカウント作成',
      MENU_ADD_ADMIN_PIC: '管理者/担当者登録',
    },
    PERSONAL_ACCOUNT: {
      TITLE: '個人アカウント作成',
      INP_FIRST_NAME: '氏',
      INP_LAST_NAME: '名',
      BTN_CREATE: '作成',
      BTN_BACK: '戻る',
    },
    PERSONAL_ACCOUNT_DONE: {
      TITLE: '個人アカウント作成',
      MSG_CREATE_DONE: '作成完了',
      MSG_NAME: '氏名',
      MSG_ID: 'ID',
      BTN_BACK_HOME: 'ホームへ戻る',
    },
    GROUP_ACCOUNT: {
      TITLE: 'グループアカウント作成',
      INP_NAME: 'グループアカウント名',
      BTN_CREATE: '作成',
      BTN_BACK: '戻る',
    },
    GROUP_ACCOUNT_DONE: {
      TITLE: 'グループアカウント作成',
      MSG_CREATE_DONE: '作成完了',
      MSG_NAME: 'グループアカウント名',
      MSG_ID: 'ID',
      BTN_BACK_HOME: 'ホームへ戻る',
    },
    GROUP_SELECT: {
      TITLE: 'グループアカウント\n管理者/担当者登録',
      MSG_SELECT_GROUP: 'グループを選択',
      BTN_MOVE_ADMIN_PAGE: '管理画面へ',
    },
    GROUP_HOME: {
      REGISTRATION: {
        INP_RADIO_ADMIN: '管理者',
        INP_RADIO_PIC: '担当者',
        INP_ID: 'アカウントID',
        INP_NAME: '氏名',
        BTN_CREATE: '作成',
        BTN_BACK: '戻る',
      },
      LIST: {
        TABLE_COL_EXPIRES_AT: '使用期限',
        TABLE_COL_NAME: '氏名',
        TABLE_COL_SIGNABLE: '署名可能数',
        TABLE_COL_ACCOUNT_TYPE: '種類',
        ACCOUNT_ADMIN: '管理者',
        ACCOUNT_PIC: '担当者',
      },
    },
    GROUP_DONE: {
      MSG_REGISTER_DONE: '登録完了',
      MSG_GROUP_NAME: 'グループアカウント名',
      MSG_ACCOUNT_TYPE: '種類',
      ACCOUNT_ADMIN: '管理者',
      ACCOUNT_PIC: '担当者',
      MSG_ACCOUNT_NAME: '氏名',
      BTN_BACK_HOME: 'ホームへ戻る',
    },
    REQUEST_VC: {
      TITLE: 'デジタル証明申請',
      MSG_SELECT_ISSUER:
        '発行者の申請サイトに遷移します。\nデジタル証明の発行者をご選択下さい。',
      BTN_MOVE_ISSUER_PAGE: '申請サイトへ',
    },
    REQUEST_LIST: {
      TITLE: 'デジタル証明申請一覧',
      APPLICATION_DATE: '申請日',
      NAME: '名称',
      STATUS: 'ステータス',
      ISSUED: '発行済',
      UNISSUED: '未発行',
      BTN_DETAIL: '照会',
    },
    VC_LIST: {
      TITLE: 'デジタル証明一覧',
    },
    ACSiON: {},
    BANK: {
      TITLE: '法人口座開設申請',
      BTN_PROGRESS: '開設申請手続きへ進む',
      MGS_REQUIREMENT:
        '申請には本人確認と法人確認証明が必要です。\nウォレットアプリをインストールし、デジタル証明を取得してからご申請ください',
      LINK_TO_DETAIL: 'もっと詳しく',
    },
    BANK_REQUEST: {
      TITLE: '法人口座開設申請',
      OPENED_VC: '開示するデジタル証明',
      APPLICATION_CONTENT: '申請内容',
      ACOUNT_TYPE: '口座種別',
      ACOUNT_OPT_SAVINGS: '普通',
      ACOUNT_OPT_FIXED: '定期',
      ACOUNT_OPT_MULTIPURPOSE: '総合',
      ACOUNT_OPT_CHECKING: '当座',
      TRANSFER_TYPE: '振込形態',
      TRANSFER_OPT_CASH: '現金',
      TRANSFER_OPT_TRANSFER: '振込',
      TRANSFER_OPT_OTHER: 'その他',
      BTN_NEXT: '次へ',
      BTN_BACK: 'Walletへ戻る',
    },
    BANK_CONFIRM: {
      TITLE: '申請内容',
      BTN_EDIT: '編集する',
      NAME: '名前',
      ADDRESS: '住所',
      CORP_NAME: '法人名',
      ACCOUNT_TYPE: '口座種別',
      TRANSFER_TYPE: '振込形態',
      BTN_APPLICATION: '申請する',
    },
    BANK_DONE: {
      TITLE: '申請が完了しました',
      APPLICATION_ID: '申請番号',
      BTN_BACK: 'Walletへ戻る',
    },
    BANK_NAVIGATION: {
      TITLE: '法人口座開設申請',
      BTN_PROGRESS: '開設申請手続きへ進む',
      OPEN_FLOW: '開設までの流れ',
      SAMPLE: 'SAMPLE',
      PROC1_HEAD: 'アプリのインストール',
      PROC1_MSG:
        'ウォレットアプリから\n口座開設に必要なデジタル証明\nを申請してください。\nアプリをインストール後\nログインします。',
      PROC2_HEAD: '本人確認(KYC)申請',
      PROC2_MSG:
        '必要なアカウントを作成し、\n「デジタル証明申請」から\n申請を行います。申請後、\nデジタル証明を発行して下さい。',
      PROC3_HEAD: '在籍証明申請',
      PROC3_MSG:
        '④には在籍証明が必要です。\n「デジタル証明申請」から\n申請を行います。申請後、\nデジタル証明を発行して下さい',
      PROC4_HEAD: '法人確認(KYB)申請',
      PROC4_MSG:
        '②と③を添付し、\n「デジタル証明申請」から\n申請を行います。申請後、\nデジタル証明を発行して下さい。',
      PROC5_HEAD: '口座開設申請',
      PROC5_MSG:
        '本サイトの開設申請\nページにて、②と④を添付し\n口座開設申請をします。',
    },
  },
  COMPONENTS: {
    ACSiON_HEADER: {},
    BANK_HEADER: {},
    BREADCRUMB: {
      HOME: 'ホーム',
      CREATE_ACCOUNT: 'アカウント作成',
      PERSONAL_ACCOUNT: '個人アカウント作成',
      PERSONAL_ACCOUNT_DONE: '個人アカウント作成',
      GROUP_ACCOUNT: 'グループアカウント作成',
      GROUP_ACCOUNT_DONE: 'グループアカウント作成',
      GROUP_SELECT: 'グループアカウント管理者\n/担当者登録',
      // GROUP_HOME: '',
      // GROUP_DONE: '',
      REQUEST_VC: 'デジタル証明申請',
      REQUEST_LIST: 'デジタル証明申請一覧',
      VC_LIST: 'デジタル証明一覧',
    },
    BUTTON: {},
    CARD: {},
    CHECK_BOX: {},
    FOOT_NAVIGATION: {},
    FOOT_NAVIGATION_BUTTON: {},
    GROUP_SELECT: {},
    HEADER: {},
    LOGIN_BUTTON: {},
    PAGE_TITLE: {},
    SELECT_BOX: {},
    TAB_MENU: {
      REGISTRATION: '新規登録',
      LIST: '登録者一覧',
    },
    TEXT_INPUT: {},
    VC_CARD: {
      HEADING: 'credential',
      BANK: '口座開設証明',
      KYB: '法人確認(KYB)',
      KYC: '本人確認(KYC)',
      INVALID: 'Invalid',
    },
    PERSON: {},
    BANK_NAVIGATION_HEADER: {
      TITLE: 'トラスト銀行',
      LINK_SITE_POLICY: 'サイトポリシー',
      LINK_PRIVACY_POLICY: 'プライバシーポリシー',
      LINK_COPYRIGHT_POLICY: 'コピーライトポリシー',
      LINK_WEB_ACCESIBILITY: 'ウェブアクセシビリティ',
      LINK_SNS: 'SNS',
      LANGUAGE: 'Language',
      LANGUAGE_OPT_JA: '日本語',
      LANGUAGE_OPT_EN: '英語',
    },
    FLOW_NAVIGATION: {
      LINK_MSG1: 'スマートフォン',
      LINK_MSG2: 'から開く',
    },
  },
};

export default ja;