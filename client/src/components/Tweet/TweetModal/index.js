import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { getTweetById, removeTweet, likeTweet } from 'actions/tweetActions';
import { connect } from 'react-redux';
import Loading from 'components/Loading';
import TweetsBoard from 'components/layout/TweetsBoard';
import portretPlaceholder from 'img/portret-placeholder.png';
import Moment from 'react-moment';
import {
  Container,
  StyledTweet,
  Main,
  TweetContent,
  TopFlex,
  ItemGroup,
  TweetUserName,
  TweetUserUsername,
  TweetText,
  Icon,
  LikeIcon,
  TweetDate,
  UserGroup,
  UserInfo,
  SocialGroup,
  TweetActionGroup,
  TweetAction,
  LikeTweetAction
} from './style';
import { UserAvatar, CloseButton } from 'shared/components';
import { Link } from 'react-router-dom';
import AddComment from '../AddComment';

function TweetModal({
  back,
  containerRef,
  closeButtonRef,
  tweet,
  liked,
  handleActionClick
}) {
  return createPortal(
    <Container onClick={back} ref={containerRef}>
      <CloseButton ref={closeButtonRef} />
      <StyledTweet>
        <Main>
          <TopFlex>
            <UserGroup>
              <Link to={`/${tweet.user.username}`}>
                <UserAvatar
                  small
                  src={tweet.user.avatar || portretPlaceholder}
                  alt="User Avatar"
                />
              </Link>
              <UserInfo>
                <ItemGroup>
                  <TweetUserName as={Link} to={`/${tweet.user.username}`}>
                    {tweet.user.name}
                  </TweetUserName>
                </ItemGroup>
                <ItemGroup>
                  @
                  <TweetUserUsername as={Link} to={`/${tweet.user.username}`}>
                    {tweet.user.username}
                  </TweetUserUsername>
                </ItemGroup>
              </UserInfo>
            </UserGroup>
          </TopFlex>

          <TweetContent>
            <TweetText>{tweet.text}</TweetText>
            <TweetDate>
              <Moment format="DD/MM/YYYY" withTitle>
                {tweet.created}
              </Moment>
            </TweetDate>

            <SocialGroup>
              <ItemGroup>
                <strong>{tweet.retweets.length} </strong> Retweet
              </ItemGroup>
              <ItemGroup>
                <strong>{tweet.likes.length}</strong> Likes
              </ItemGroup>
            </SocialGroup>

            <TweetActionGroup>
              <TweetAction>
                <Icon
                  className="far fa-comment"
                  onClick={() => alert('Comment')}
                />{' '}
                <strong>{tweet.comments.length}</strong>
              </TweetAction>
              <TweetAction>
                <Icon
                  className="fas fa-retweet"
                  onClick={() => alert('Retweet')}
                />{' '}
                <strong>{tweet.retweets.length}</strong>
              </TweetAction>
              <LikeTweetAction
                onClick={e => handleActionClick(e, 'like', tweet._id)}
              >
                <LikeIcon className="far fa-heart" liked={liked} />{' '}
                <strong>{tweet.likes.length}</strong>
              </LikeTweetAction>
            </TweetActionGroup>
          </TweetContent>
        </Main>

        <AddComment />
        <TweetsBoard tweets={tweet.comments} comments={true} />
      </StyledTweet>
    </Container>,
    document.getElementById('root')
  );
}

TweetModal.propTypes = {
  back: PropTypes.func.isRequired,
  tweet: PropTypes.object.isRequired,
  handleActionClick: PropTypes.func.isRequired,
  liked: PropTypes.bool.isRequired
};

function TweetModalContainer(props) {
  const { status_id } = props.match.params;
  const containerRef = useRef(null);
  const closeButtonRef = useRef(null);

  const {
    auth,
    tweet: { tweet, loading },
    errors,
    getTweetById,
    removeTweet,
    likeTweet,
    history
  } = props;

  useEffect(() => {
    if (!tweet) {
      getTweetById(status_id);
    }
  }, [status_id]);

  const back = e => {
    if (
      e.target !== containerRef.current &&
      e.target !== closeButtonRef.current
    ) {
      return;
    }
    history.goBack();
  };

  const pushToLogin = () => {
    history.push('/signin');
  };

  const handleActionClick = (e, action, tweet_id) => {
    e.stopPropagation();
    if (auth.isAuthenticated) {
      if (action === 'like') {
        likeTweet(tweet_id, auth.user._id);
      } else if (action === 'remove') {
        removeTweet(tweet_id);
      }
    } else {
      pushToLogin();
    }
  };

  if (loading || !tweet) {
    return <Loading />;
  }

  const liked = !!(
    auth.user && tweet.likes.find(like => like.user === auth.user._id)
  );

  return (
    <TweetModal
      containerRef={containerRef}
      closeButtonRef={closeButtonRef}
      back={back}
      tweet={tweet}
      liked={liked}
      handleActionClick={handleActionClick}
    />
  );
}

TweetModalContainer.propTypes = {
  auth: PropTypes.object.isRequired,
  tweet: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  getTweetById: PropTypes.func.isRequired,
  removeTweet: PropTypes.func.isRequired,
  likeTweet: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
  auth: state.auth,
  tweet: state.tweet,
  errors: state.errors
});

export default connect(
  mapStateToProps,
  { getTweetById, removeTweet, likeTweet }
)(withRouter(TweetModalContainer));
