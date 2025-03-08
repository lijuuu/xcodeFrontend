interface User {
  UserID: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  AvatarURL: string;
  Email: string;
  Role: string;
  Status: string;
  Country: string;
  PrimaryLanguageID: string;
  MuteNotifications: boolean;
  Socials: {
    Github: string;
    Twitter: string;
    Linkedin: string;
  };
  CreatedAt: string;
}

export type { User };