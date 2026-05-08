export interface Dictionary {
  common: {
    home: string; prompts: string; skills: string; categories: string; trending: string; tags: string;
    guide: string; submit: string; login: string; register: string; logout: string;
    profile: string; search: string; back: string; loading: string; noData: string;
    save: string; cancel: string; delete: string; edit: string; confirm: string;
    copy: string; copied: string; share: string; like: string; bookmark: string;
    more: string; all: string; viewAll: string;
    or: string; closeSearch: string; toggleTheme: string; switchLanguage: string;
    openNavigation: string; navigationMenu: string; close: string; backToTop: string;
    popular: string;
    // New keys
    report: string; reportSubmitted: string; reportReason: string; reportSpam: string;
    reportAbuse: string; reportCopyright: string; reportOther: string;
    following: string; follow: string; unfollow: string;
    collections: string; myCollections: string; newCollection: string;
    collectionName: string; collectionDesc: string; addToCollection: string;
    noResults: string; tryDifferent: string;
    notifications: string; markAllRead: string; noNotifications: string;
    clearAll: string; viewMore: string; ago: string;
    filters: string; clearFilters: string; activeFilters: string;
    verified: string; official: string;
    playground: string; runPrompt: string; running: string;
    reset: string; detail: string; generatePreview: string; previewPrompt: string;
    screenshots: string; versionHistory: string; changelog: string;
    dependencies: string; noDependencies: string;
    edited: string;
    passwordWeak: string; passwordFair: string; passwordGood: string; passwordStrong: string; passwordVeryStrong: string;
    loadMore: string; remaining: string;
  };
  home: {
    featuredTitle: string; featuredSubtitle: string;
    tabAgent: string; tabPrompt: string;
    exploreDirections: string;
    heroTitle: string; heroSubtitle: string; heroCta: string; heroCtaGuide: string;
    heroBadge: string; heroPlatforms: string; heroTrust: string;
    sectionHot: string; sectionHotSub: string;
    sectionNew: string; sectionNewSub: string;
    sectionBeginner: string; sectionBeginnerSub: string;
    categoryTitle: string; categorySubtitle: string;
    testimonialTitle: string; testimonialSubtitle: string;
  };
  prompts: {
    title: string; subtitle: string; filterAll: string; sortBy: string;
    sortPopular: string; sortRating: string; sortNewest: string;
    usageCount: string; viewDetail: string; difficulty: string; version: string;
    notFound: string; backToList: string; searchPlaceholder: string;
    emptySearch: string;
    difficultyEasy: string; difficultyMedium: string; difficultyHard: string;
  };
  promptDetail: {
    backToList: string; copyPrompt: string; copyFailed: string;
    onlineVersion: string; localVersion: string; onlineDesc: string; localDesc: string;
    variables: string; variablesDesc: string; beforeAfter: string; input: string;
    output: string; usage: string; onlinePlatform: string; localModel: string;
    models: string; modelsYear: string; advancedTips: string; versionHistory: string;
    relatedSkills: string; notFound: string; temperature: string; effectNote: string;
    modelsTableLabel: string; modelsTableCaption: string;
    modelName: string; modelStrengths: string; modelUseCase: string; modelAudience: string;
    premium: string; upgradeToPremium: string; premiumComingSoon: string;
  };
  agentSkills: {
    title: string; subtitle: string; filterAll: string; sortBy: string;
    sortPopular: string; sortRating: string; sortNewest: string;
    usageCount: string; viewDetail: string; difficulty: string; version: string;
    notFound: string; backToList: string; searchPlaceholder: string;
    emptySearch: string;
    capabilities: string; tools: string; platforms: string;
    setupGuide: string; triggerExamples: string; description: string;
    install: string; installCopied: string;
    overview: string; readme: string; files: string; preview: string;
    downloads: string; stars: string; author: string; license: string;
    lastUpdated: string; collection: string; category: string;
    tryItOut: string; tryPlaceholder: string; runPreview: string;
    fileTree: string; collections: string; categories: string;
    heroTitle: string; heroSubtitle: string; heroCta: string;
    sectionHot: string; sectionHotSub: string;
    developer: string; downloadAll: string; downloadFile: string;
    feedback: string; writeComment: string; metadata: string;
    skillIntro: string; skillFiles: string;
    collectionAll: string; collectionCommunity: string;
    collectionDevTools: string; collectionProductivity: string;
    collectionDataTools: string;
    trending: string;
  };
  categories: { title: string; subtitle: string; viewAll: string; exploreSkill: string;
    nameContent: string; descContent: string;
    nameCoding: string; descCoding: string;
    nameThinking: string; descThinking: string;
    nameData: string; descData: string;
    nameProductivity: string; descProductivity: string;
    nameCreative: string; descCreative: string;
    agentNameSkillsMgmt: string; agentDescSkillsMgmt: string;
    agentNameWebDev: string; agentDescWebDev: string;
    agentNameWebSearch: string; agentDescWebSearch: string;
    agentNameMultiPlatform: string; agentDescMultiPlatform: string;
    agentNameCodeExec: string; agentDescCodeExec: string;
    agentNameFileProc: string; agentDescFileProc: string;
    agentNameComm: string; agentDescComm: string;
    agentNameDataAnalysis: string; agentDescDataAnalysis: string;
    catNotFound: string; catBackToBrowse: string; catPromptTemplates: string; catAgentSkills: string; catNoContent: string;
  };
  trending: {
    title: string; subtitle: string; hot: string; newest: string;
    featured: string; mostLiked: string; gold: string; silver: string; bronze: string;
  };
  tags: { title: string; subtitle: string; relatedSkills: string; backToCloud: string; searchPlaceholder: string; tagCount: string; };
  comments: {
    title: string; writeComment: string; placeholder: string; submitComment: string;
    loginToComment: string; noComments: string; rating: string; likes: string;
    reply: string; cancelReply: string; replyingTo: string;
    commentPublished: string; commentRequired: string; commentCount: string;
    deleteConfirm: string; commentEdited: string;
  };
  profile: {
    title: string; overview: string; favorites: string; likes: string;
    submissions: string; comments: string; history: string; settings: string;
    notifications: string;
    joinedAt: string; noFavorites: string; noLikes: string; noSubmissions: string;
    noComments: string; noHistory: string; browseSkills: string;
    recentActivity: string; noActivity: string; noActivityDesc: string;
    likedLabel: string; bookmarkedLabel: string; commentedLabel: string;
    submittedLabel: string; viewedLabel: string; copiedLabel: string;
    copiedPrompt: string; viewedSkill: string;
    adminRole: string; userRole: string;
    stats: { submissions: string; likes: string; bookmarks: string; comments: string; };
    noCommentsDesc: string; noLikesDesc: string; noFavoritesDesc: string;
    noSubmissionsDesc: string; noHistoryDesc: string;
    unsavedChanges: string;
  };
  settings: {
    editProfile: string; username: string; bio: string; bioPlaceholder: string;
    changePassword: string; currentPassword: string; newPassword: string;
    confirmPassword: string; themePreference: string; dark: string; light: string;
    system: string; dataManage: string; exportData: string; clearData: string;
    deleteAccount: string; deleteConfirm: string; passwordMismatch: string;
    profileUpdated: string; passwordChanged: string; wrongPassword: string;
    saveProfile: string; exportDesc: string; dangerZone: string;
    dangerDesc: string; confirmDelete: string;
    usernameRequired: string; passwordMinLength: string; fillAllFields: string;
    dataExported: string; dataCleared: string; accountDeleted: string;
    passwordPlaceholder: string;
    deleteConfirmPrompt: string; deleteConfirmMismatch: string;
    importData: string; importSuccess: string; importError: string;
    clearDataConfirmTitle: string; clearDataConfirmDesc: string;
  };
  submit: {
    title: string; subtitle: string; basicInfo: string; templateName: string;
    templateNamePlaceholder: string; shortDesc: string; shortDescPlaceholder: string;
    category: string; promptContent: string; onlinePrompt: string; onlinePlaceholder: string;
    localPrompt: string; localPlaceholder: string; usage: string; usagePlaceholder: string;
    submitBtn: string; successTitle: string; successDesc: string; continueSubmit: string;
    viewHistory: string; mySubmissions: string;
    nameRequired: string; nameMinLength: string; shortDescRequired: string;
    categoryRequired: string; promptRequired: string; promptMinLength: string;
    usageRequired: string; savedLocally: string;
    statusPending: string; statusApproved: string; statusRejected: string;
    recordDeleted: string; loginToView: string; backToSubmit: string;
    viewHistoryDesc: string; noSubmissionsYet: string; goToSubmit: string;
    reviewNoteLabel: string;
    anonymousUser: string;
  };
  guide: {
    title: string; subtitle: string;
    badge: string; welcome: string;
    whatIsHub: string; hubDesc: string;
    agentSkillsLabel: string; agentSkillsDesc: string;
    promptTemplatesLabel: string; promptTemplatesDesc: string;
    noExpertise: string; noExpertiseDesc: string;
    whatIsPrompt: string; promptDesc: string; promptDesc2: string;
    example: string; promptExample: string; promptExampleTopic: string; variableNote: string;
    whatIsAgentSkill: string; agentSkillDesc1: string; agentSkillDesc2: string;
    installExample: string; installNote: string;
    onlineVsLocal: string;
    onlineTitle: string; onlineDesc: string; onlinePro1: string; onlinePro2: string; onlineCon: string;
    localTitle: string; localDesc: string; localPro: string; localCon: string;
    quickStart: string;
    useAgentSkill: string;
    browseMarket: string; browseMarketDesc: string;
    oneClickInstall: string; oneClickInstallDesc: string;
    startUsing: string; startUsingDesc: string;
    usePromptTemplate: string;
    selectTemplate: string; selectTemplateDesc: string;
    fillVariables: string; fillVariablesDesc: string;
    pasteAndUse: string; pasteAndUseDesc: string;
    engineeringTips: string; engineeringTipsDesc: string;
    cotTitle: string; cotDesc: string; cotExample: string;
    fewShotTitle: string; fewShotDesc: string; fewShotExample: string;
    roleTitle: string; roleDesc: string; roleExample: string;
    structuredTitle: string; structuredDesc: string; structuredExample: string;
    selfCritiqueTitle: string; selfCritiqueDesc: string; selfCritiqueExample: string;
    betterResults: string;
    specificVsVague: string; vagueLabel: string; vagueExample: string;
    betterLabel: string; betterExample1: string;
    specifyFormat: string; vagueFormatLabel: string; vagueFormatExample: string;
    betterFormatLabel: string; betterFormatExample: string;
    iterate: string; iterateDesc: string;
    provideContext: string; provideContextDesc: string;
    readyToStart: string; browseAgentSkills: string; browsePromptTemplates: string;
  };
  auth: {
    loginTitle: string; loginSubtitle: string; registerTitle: string; registerSubtitle: string;
    email: string; password: string; username: string; noAccount: string; hasAccount: string;
    loginNow: string; registerNow: string;
    fillAllFields: string; emailOrPasswordError: string; loginSuccess: string;
    welcomeBack: string; forgotPassword: string;
    oauthComingSoon: string; loginWithGoogle: string; loginWithGithub: string;
    comingSoon: string;
    passwordMinLength: string; emailInvalid: string; emailExists: string;
    registerSuccess: string; createAccountDesc: string;
    usernamePlaceholder: string; passwordPlaceholder: string;
    oauthRegisterComingSoon: string; registerWithGoogle: string; registerWithGithub: string;
    confirmPassword: string; confirmPasswordPlaceholder: string; passwordMismatch: string;
    resetPassword: string; resetPasswordDesc: string; resetPasswordSuccess: string;
    emailNotFound: string; setNewPassword: string;
    loginRedirect: string; sessionExpired: string;
  };
  notFound: {
    title: string; description: string; backHome: string;
    searchPlaceholder: string; popularSkills: string; popularPrompts: string;
    browseSkills: string; browsePrompts: string;
  };
  error: {
    title: string; description: string; retry: string;
  };
  commandPalette: {
    searchPlaceholder: string; noResults: string;
    navigationHint: string; shortcutHint: string;
  };
  footer: {
    description: string; quickLinks: string; browse: string; resources: string; community: string;
    blog: string; changelog: string; api: string; github: string; discord: string;
    twitter: string; newsletter: string; newsletterPlaceholder: string; subscribe: string;
    unsubscribe: string; unsubscribeDesc: string; managePreferences: string;
    trademarkDisclaimer: string;
    copyright: string; platforms: string;
    emailRequired: string; emailInvalid: string; alreadySubscribed: string; subscribeSuccess: string;
    comingSoon: string;
  };
  rateLimit: {
    tooFast: string;
  };
  create: {
    newSkill: string; newPrompt: string;
    quickCreate: string; quickCreateDesc: string;
    customCreate: string; customCreateDesc: string;
    // Github import
    importGithub: string; githubUrl: string; githubUrlPlaceholder: string;
    parse: string; selectSkills: string; confirmCreate: string; importSuccess: string;
    selectPrompts: string; selectPromptsDesc: string;
    // Custom create — Agent Skill
    englishName: string; displayName: string; displayNamePlaceholder: string;
    sourceUrl: string; sourceUrlPlaceholder: string;
    owner: string; ownerPlaceholder: string;
    isPublic: string; publicLabel: string; privateLabel: string;
    description: string; descriptionPlaceholder: string;
    skillType: string; customTags: string; customTagsPlaceholder: string;
    icon: string; changeIcon: string;
    skillFile: string; noFileSelected: string; uploadHint: string;
    // Custom create — Prompt Template
    templateTitle: string; templateTitlePlaceholder: string;
    templateSubtitle: string; templateSubtitlePlaceholder: string;
    templateDesc: string; templateDescPlaceholder: string;
    templateCategory: string; templateDifficulty: string;
    promptOnline: string; promptOnlinePlaceholder: string;
    promptLocal: string; promptLocalPlaceholder: string;
    promptVersion: string; templateTags: string; templateTagsPlaceholder: string;
    difficultyEasy: string; difficultyMedium: string; difficultyHard: string;
    promptRequired: string; templateCategoryRequired: string;
    // Common
    step: string; parsing: string; parsingDesc: string;
    back: string; next: string; finish: string;
    successTitle: string; successDesc: string;
    createAnother: string; viewSkill: string;
    // Validation
    nameRequired: string; displayNameRequired: string;
    ownerRequired: string; descRequired: string; fileRequired: string;
    githubUrlRequired: string; selectAtLeastOne: string;
    skillTypeWebDev: string; skillTypeCodeExec: string; skillTypeFileProc: string;
    skillTypeDataAnalysis: string; skillTypeMultiPlatform: string;
    skillTypeCommunication: string; skillTypeOther: string;
    premiumSkill: string; premiumDesc: string; premiumUnlock: string;
    unlockView: string; loginUnlock: string; registerFree: string;
  };
  avatar: {
    changeAvatar: string; uploadHint: string; fileTooLarge: string;
    zoomIn: string; zoomOut: string; confirm: string; cancel: string;
    dragToAdjust: string;
  };
  userProfile: {
    userNotFound: string; goBack: string; publishedSkills: string;
    noPublishedSkills: string; noPublishedSkillsDesc: string;
    totalDownloads: string; totalStars: string; publishedCount: string;
    joinedAt: string;
  };
  admin: {
    title: string; pendingSubmissions: string; userManage: string; skillAnalytics: string;
    commentManage: string; approve: string; reject: string; reviewNote: string;
    noPending: string; registeredUsers: string; noUsers: string;
    totalSubmissions: string; totalComments: string; adminBadge: string;
    reviewed: string; approved: string; rejected: string;
    noAccess: string; noAccessDesc: string; backHome: string;
    reviewNotePlaceholder: string; adminSubtitle: string;
    noComments: string; skillPrefix: string;
    adminSecurityNote: string; confirmDeleteComment: string;
  };
  search: {
    title: string; subtitle: string; placeholder: string;
    recentSearches: string; clearRecent: string;
    noResults: string; noResultsDesc: string;
    agentSkills: string; promptTemplates: string;
    viewAllSkills: string; viewAllPrompts: string;
    suggestions: string; removeRecent: string;
  };
  compare: {
    title: string; compareButton: string; compareCount: string;
    backToSkills: string; selectTwo: string; toggleCompare: string;
    higher: string; downloads: string; stars: string; author: string;
    description: string; category: string; tags: string; version: string;
    license: string; installCommand: string; noSkillsSelected: string;
  };
  notificationPrefs: {
    title: string; description: string;
    commentReply: string; commentReplyDesc: string;
    skillUpdate: string; skillUpdateDesc: string;
    submissionStatus: string; submissionStatusDesc: string;
    like: string; likeDesc: string;
    follow: string; followDesc: string;
    system: string; systemDesc: string;
    preferences: string;
  };
  collections: {
    createFirst: string;
    createCollection: string;
    emptyCollection: string;
    collectionColor: string;
  };
}
