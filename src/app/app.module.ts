import { CommonModule, DatePipe } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/fragments/navbar/navbar.component';
import { FooterComponent } from './components/fragments/footer/footer.component';
import { WelcomeComponent } from './components/pages/welcome/welcome.component';
import { BackgroundImageCoverDirective } from './directives/background-image-cover.directive';
import { PayoutPipe } from './pipes/payout.pipe';
import { PhonePipe } from './pipes/phone.pipe';
import { StripeAmountFormatterPipe } from './pipes/stripe-amount-formatter.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { CommonAlertsFragmentComponent } from './components/fragments/alerts-fragment/alerts-fragment.component';
import { CommonModalOverlayComponent } from './components/fragments/modal-overlay/modal-overlay.component';
import { UserProfileCardComponent } from './components/fragments/user-profile-card/user-profile-card.component';
import { AboutComponent } from './components/pages/about/about.component';
import { ContactComponent } from './components/pages/contact/contact.component';
import { PrivacyPolicyComponent } from './components/pages/privacy-policy/privacy-policy.component';
import { SigninComponent } from './components/pages/signin/signin.component';
import { SignoutComponent } from './components/pages/signout/signout.component';
import { SignupComponent } from './components/pages/signup/signup.component';
import { TermsAgreementsComponent } from './components/pages/terms-agreements/terms-agreements.component';
import { UserConversationsComponent } from './components/pages/user/conversations/conversations.component';
import { UserFollowersComponent } from './components/pages/user/followers/followers.component';
import { UserFollowingsComponent } from './components/pages/user/followings/followings.component';
import { UserHomeFragmentComponent } from './components/pages/user/home/home.component';
import { UserMessagesFragmentComponent } from './components/pages/user/messages/messages.component';
import { UserNotificationsFragmentComponent } from './components/pages/user/notifications/notifications.component';
import { UserSettingsFragmentComponent } from './components/pages/user/settings/settings.component';
import { UserFieldsComponent } from './components/pages/user/user-fields/user-fields.component';
import { UserPageComponent } from './components/pages/user/user-page.component';
import { UserVerifyStripeAccountFragmentComponent } from './components/pages/user/verify-stripe-account-fragment/verify-stripe-account-fragment.component';
import { VerifyStripeAccountComponent } from './components/pages/verify-stripe-account/verify-stripe-account.component';
import { APP_INIT_PROVIDER } from './_misc/app-init';
import { NoticeComponent } from './components/fragments/model/notice/notice.component';
import { FeedInterviewsPageComponent } from './components/pages/feed-interviews-page/feed-interviews-page.component';
import { FeedQuestionsPageComponent } from './components/pages/feed-questions-page/feed-questions-page.component';
import { FeedNoticessPageComponent } from './components/pages/feed-noticess-page/feed-noticess-page.component';
import { SpinnerComponent } from './components/fragments/spinner/spinner.component';
import { NoticePageComponent } from './components/pages/notice-page/notice-page.component';
import { NoticeFormComponent } from './components/fragments/forms/notice-form/notice-form.component';
import { InterviewFormComponent } from './components/fragments/forms/interview-form/interview-form.component';
import { QuestionFormComponent } from './components/fragments/forms/question-form/question-form.component';
import { AnswerFormComponent } from './components/fragments/forms/answer-form/answer-form.component';
import { TextFormComponent } from './components/fragments/forms/text-form/text-form.component';
import { TextareaFormComponent } from './components/fragments/forms/textarea-form/textarea-form.component';
import { InterviewPageComponent } from './components/pages/interview-page/interview-page.component';
import { QuestionPageComponent } from './components/pages/question-page/question-page.component';
import { NoticesComponent } from './components/pages/user/notices/notices.component';
import { InterviewerComponent } from './components/pages/user/interviewer/interviewer.component';
import { IntervieweeComponent } from './components/pages/user/interviewee/interviewee.component';
import { QuestionsComponent } from './components/pages/user/questions/questions.component';
import { AnswersComponent } from './components/pages/user/answers/answers.component';
import { AnswerPageComponent } from './components/pages/answer-page/answer-page.component';
import { InterviewComponent } from './components/fragments/model/interview/interview.component';
import { BypassResourceUrlPipe } from './pipes/bypass-resource-url.pipe';
import { InterviewCommentComponent } from './components/fragments/model/interview-comment/interview-comment.component';
import { InterviewCommentReplyComponent } from './components/fragments/model/interview-comment-reply/interview-comment-reply.component';
import { RatingFormComponent } from './components/fragments/forms/rating-form/rating-form.component';
import { TooltipModule } from './modules/tooltip/tooltip.module';
import { InterviewCommentsPageComponent } from './components/pages/interview-page/interview-comments-page/interview-comments-page.component';
import { InterviewInterviewerRatingsPageComponent } from './components/pages/interview-page/interview-interviewer-ratings-page/interview-interviewer-ratings-page.component';
import { InterviewIntervieweeRatingsPageComponent } from './components/pages/interview-page/interview-interviewee-ratings-page/interview-interviewee-ratings-page.component';
import { SimilarInterviewResultsPageComponent } from './components/pages/interview-page/similar-interview-results-page/similar-interview-results-page.component';
import { InterviewerRatingComponent } from './components/fragments/model/interviewer-rating/interviewer-rating.component';
import { IntervieweeRatingComponent } from './components/fragments/model/interviewee-rating/interviewee-rating.component';
import { RatingStarsComponent } from './components/fragments/rating-stars/rating-stars.component';
import { CsrfInterceptor } from './interceptors/csrf.interceptor';
import { UserFollowStatusComponent } from './components/fragments/user-follow-status/user-follow-status.component';

@NgModule({
  declarations: [
    BackgroundImageCoverDirective,

    PayoutPipe,
    PhonePipe,
    StripeAmountFormatterPipe,
    TimeAgoPipe,

    AppComponent,
    NavbarComponent,
    FooterComponent,
    WelcomeComponent,
    SignupComponent,
    SigninComponent,
    AboutComponent,
    ContactComponent,
    TermsAgreementsComponent,
    PrivacyPolicyComponent,
    SignoutComponent,

    UserHomeFragmentComponent,
    UserSettingsFragmentComponent,
    UserPageComponent,
    UserNotificationsFragmentComponent,
    UserFieldsComponent,
    UserVerifyStripeAccountFragmentComponent,
    UserMessagesFragmentComponent,
    UserConversationsComponent,
    UserFollowersComponent,
    UserFollowingsComponent,
    VerifyStripeAccountComponent,
    CommonAlertsFragmentComponent,
    CommonModalOverlayComponent,
    UserProfileCardComponent,
    NoticeComponent,
    FeedInterviewsPageComponent,
    FeedQuestionsPageComponent,
    FeedNoticessPageComponent,
    SpinnerComponent,
    NoticePageComponent,
    NoticeFormComponent,
    InterviewFormComponent,
    QuestionFormComponent,
    AnswerFormComponent,
    TextFormComponent,
    TextareaFormComponent,
    InterviewPageComponent,
    QuestionPageComponent,
    NoticesComponent,
    InterviewerComponent,
    IntervieweeComponent,
    QuestionsComponent,
    AnswersComponent,
    AnswerPageComponent,
    InterviewComponent,
    BypassResourceUrlPipe,
    InterviewCommentComponent,
    InterviewCommentReplyComponent,
    RatingFormComponent,
    InterviewCommentsPageComponent,
    InterviewInterviewerRatingsPageComponent,
    InterviewIntervieweeRatingsPageComponent,
    SimilarInterviewResultsPageComponent,
    InterviewerRatingComponent,
    IntervieweeRatingComponent,
    RatingStarsComponent,
    UserFollowStatusComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
  ],
  providers: [
    APP_INIT_PROVIDER,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CsrfInterceptor,
      multi: true
    },

    PayoutPipe,
    PhonePipe,
    StripeAmountFormatterPipe,
    TimeAgoPipe,
    DatePipe,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
