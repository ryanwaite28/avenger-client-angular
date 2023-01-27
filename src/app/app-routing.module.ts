import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/pages/about/about.component';
import { AnswerPageComponent } from './components/pages/answer-page/answer-page.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { FeedInterviewsPageComponent } from './components/pages/feed-interviews-page/feed-interviews-page.component';
import { FeedNoticessPageComponent } from './components/pages/feed-noticess-page/feed-noticess-page.component';
import { FeedQuestionsPageComponent } from './components/pages/feed-questions-page/feed-questions-page.component';
import { InterviewPageComponent } from './components/pages/interview-page/interview-page.component';
import { NoticePageComponent } from './components/pages/notice-page/notice-page.component';
import { PrivacyPolicyComponent } from './components/pages/privacy-policy/privacy-policy.component';
import { QuestionPageComponent } from './components/pages/question-page/question-page.component';
import { SigninComponent } from './components/pages/signin/signin.component';
import { SignoutComponent } from './components/pages/signout/signout.component';
import { SignupComponent } from './components/pages/signup/signup.component';
import { TermsAgreementsComponent } from './components/pages/terms-agreements/terms-agreements.component';
import { UserConversationsComponent } from './components/pages/user/conversations/conversations.component';
import { UserHomeFragmentComponent } from './components/pages/user/home/home.component';
import { UserMessagesFragmentComponent } from './components/pages/user/messages/messages.component';
import { UserNotificationsFragmentComponent } from './components/pages/user/notifications/notifications.component';
import { UserSettingsFragmentComponent } from './components/pages/user/settings/settings.component';
import { UserPageComponent } from './components/pages/user/user-page.component';
import { UserVerifyStripeAccountFragmentComponent } from './components/pages/user/verify-stripe-account-fragment/verify-stripe-account-fragment.component';
import { VerifyStripeAccountComponent } from './components/pages/verify-stripe-account/verify-stripe-account.component';
import { WelcomeComponent } from './components/pages/welcome/welcome.component';
import { ROUTE_PAGES } from './enums/all.enums';
import { UserAuthGuard } from './guards/auth.guard';
import { SignedInGuard } from './guards/signed-in.guard';
import { SignedOutGuard } from './guards/signed-out.guard';
import { AnswerResolver } from './resolvers/answer.resolver';
import { InterviewResolver } from './resolvers/interview.resolver';
import { NoticeResolver } from './resolvers/notice.resolver';
import { QuestionResolver } from './resolvers/question.resolver';
import { UserResolver } from './resolvers/user.resolver';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'welcome' },
  { path: 'welcome', pathMatch: 'full', component: WelcomeComponent },
  { path: 'about', pathMatch: 'full', component: AboutComponent },
  { path: 'contact', pathMatch: 'full', component: ContactComponent },
  { path: 'terms-agreements', pathMatch: 'full', component: TermsAgreementsComponent },
  { path: 'privacy-policy', pathMatch: 'full', component: PrivacyPolicyComponent },
  { path: 'signup', pathMatch: 'full', component: SignupComponent, canActivate: [SignedOutGuard] },
  { path: 'signin', pathMatch: 'full', component: SigninComponent, canActivate: [SignedOutGuard] },
  { path: 'signout', pathMatch: 'full', component: SignoutComponent, canActivate: [SignedInGuard] },
  { path: 'verify-stripe-account/:user_uuid', pathMatch: 'full', component: VerifyStripeAccountComponent },
  
  { path: 'feed/notices', pathMatch: 'full', component: FeedNoticessPageComponent, canActivate: [SignedInGuard] },
  { path: 'feed/interviews', pathMatch: 'full', component: FeedInterviewsPageComponent, canActivate: [SignedInGuard] },
  // { path: 'feed/questions', pathMatch: 'full', component: FeedQuestionsPageComponent, canActivate: [SignedInGuard] },
  
  { path: 'notices/:notice_id', pathMatch: 'full',  component: NoticePageComponent, resolve: { notice: NoticeResolver }, data: { page: ROUTE_PAGES.NOTICE_PAGE } },
  { path: 'interviews/:interview_id', pathMatch: 'full',  component: InterviewPageComponent, resolve: { interview: InterviewResolver }, data: { page: ROUTE_PAGES.INTERVIEW_PAGE } },
  { path: 'questions/:question_id', pathMatch: 'full',  component: QuestionPageComponent, resolve: { question: QuestionResolver }, data: { page: ROUTE_PAGES.QUESTION_PAGE } },
  { path: 'answers/:answer_id', pathMatch: 'full',  component: AnswerPageComponent, resolve: { answer: AnswerResolver }, data: { page: ROUTE_PAGES.ANSWER_PAGE } },

  {
    path: 'users/:user_id',
    component: UserPageComponent,
    resolve: {
      user: UserResolver,
    },
    data: { authParamsProp: 'user_id' },
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      
      { path: 'home', component: UserHomeFragmentComponent },

      { path: 'settings', component: UserSettingsFragmentComponent, canActivate: [UserAuthGuard], data: { authParamsProp: 'user_id' } },
      { path: 'notifications', component: UserNotificationsFragmentComponent, canActivate: [UserAuthGuard], data: { authParamsProp: 'user_id' } },
      { path: 'messages', component: UserMessagesFragmentComponent, canActivate: [UserAuthGuard], data: { authParamsProp: 'user_id' } },
      { path: 'conversations', component: UserConversationsComponent, canActivate: [UserAuthGuard], data: { authParamsProp: 'user_id' } },
      { path: 'verify-stripe-account', component: UserVerifyStripeAccountFragmentComponent, canActivate: [UserAuthGuard], data: { authParamsProp: 'user_id' } },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { onSameUrlNavigation: 'reload' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
