const bcrypt = require("bcryptjs");
const User = require("../../model/User/User");
const { appErr, AppErr } = require("../../utils/appErr");
const generateToken = require("../../utils/generateToken");
const getTokenFromHeader = require("../../utils/getTokenFromHeader");
//register
const userRegisterCtrl = async (req, res, next) => {
  const { firstname, lastname, email, password } = req.body;
  try {
    //Check if email exist
    const userFound = await User.findOne({ email });
    if (userFound) {
      return next(new AppErr("User Already Exist", 500));
    }
    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //create the user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
    });
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    next(appErr(error.message));
  }
};

//login
const userLoginCtrl = async (req, res) => {
  const { email, password } = req.body;
  try {
    //check if email exists
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.json({
        msg: "invalid login credentials",
      });
    }
    //verify password
    const isPasswordMatched = await bcrypt.compare(
      password,
      userFound.password
    );

    if (!isPasswordMatched) {
      return res.json({
        msg: "invalid login credentials",
      });
    }
    res.json({
      status: "success",
      data: {
        firstname: userFound.firstname,
        lastname: userFound.lastname,
        email: userFound.email,
        isAdmin: userFound.isAdmin,
        token: generateToken(userFound._id),
      },
    });
  } catch (error) {
    res.json(error.message);
  }
};

//to view my profile
const whoViewedMyProfileCtrl = async (req, res, next) => {
  try {
    //find the original user
    const user = await User.findById(req.params.id);
    //find hthe user who viewed hte orignal user
    const userWhoViewed = await User.findById(req.userAuth);

    //check if orignal user and who view are found
    if (user && userWhoViewed) {
      //check if userwhoviewd is already in the users array
      const isUserAlreadyViewed = user.viewers.find(
        (viewers) => viewer.toString() === userWhoViewed,
        _id.toJSON()
      );
      if (isUserAlreadyViewed) {
        return next(appErr("Your already viewed this user"));
      } else {
        //push the user who viewed to the user;s viewers array
        user.viewers.push(userWhoViewed._id);
        //save the user
        await user.save();
        res.json({
          status: "success",
          data: "you have successfully viewed this profile",
        });
      }
    }
  } catch (error) {
    res.json(error.message);
  }
};

//following
const followingCtrl = async (req, res, next) => {
  try {
    //find the user to follow
    const userToFollow = await User.findById(req.params.id);
    //find the user who is following
    const userWhoFollowed = await User.findById(req.userAuthor);

    //check if the user and userWhoFollowed are the found
    if (userToFollow && userWhoFollowed) {
      //check if userWhoFollowed is already in the the user's followers array
      const isUserAlreadyFollowed = userToFollow.following.find(
        (follower) => follower.toString() === userWhoFollowed._id.toString()
      );
      if (isUserAlreadyFollowed) {
        return next(appErr("you already followed this user"));
      } else {
        // push userWhoFollowed into user's following array
        userToFollow.followers.push(userWhoFollowed._id);
        //push userWhoFollow into userWhoFollowed flllowing array
        userWhoFollowed.following.push(userToFollow._id);

        //save
        await userWhoFollowed.save();
        await userToFollow.save();
        res.json({
          status: "success",
          data: "You have successfully followed this user",
        });
      }
    }
  } catch (error) {
    res.json(error.message);
  }
};

//unfollow
const unFollowCtrl = async (req, res, next) => {
  try {
    //find the user to follow
    const userToBeUnfollowed = await User.findById(req.params.id);
    //find the user who is following
    const userWhoUnFollowed = await User.findById(req.userAuthor);

    //check if the user and userWhoFollowed are the found
    if (userToBeUnfollowed && userWhoUnFollowed) {
      //check if userWhoFollowed is already in the the user's followers array
      const isUserAlreadyFollowed = userToBeUnfollowed.followers.find(
        (follower) => follower.toString() === userWhoUnFollowed._id.toString()
      );
      if (isUserAlreadyFollowed) {
        return next(appErr("You have not followed this user"));
      } else {
        // push userWhoFollowed into user's following array
        userToBeUnfollowed.followers.push(userToBeUnfollowed._id);
        //push userWhoFollow into userWhoFollowed flllowing array
        userToBeUnfollowed.following.push(userWhoUnFollowed._id);

        //save
        await userToBeUnfollowed.save();
        await userWhoUnFollowed.save();
        res.json({
          status: "success",
          data: "You have successfully unfollowed this user",
        });
      }
    }
  } catch (error) {
    res.json(error.message);
  }
};

//all
const usersCtrl = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: "all user route",
    });
  } catch (error) {
    res.json(error.message);
  }
};

//profile
const userProfileCtrl = async (req, res) => {
  try {
    const user = await User.findById(req.userAuth);
    res.json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.json(error.message);
  }
};

//delete
const deleteUserCtrl = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: "delete user route",
    });
  } catch (error) {
    res.json(error.message);
  }
};

//update
const updateUserCtrl = async (req, res) => {
  try {
    res.json({
      status: "success",
      data: "update user route",
    });
  } catch (error) {
    res.json(error.message);
  }
};

//profle Photo upload
const profilePhotoUploadCtrl = async (req, res, next) => {
  try {
    //Find the user to updated
    const userToUpdate = await User.findById(req.userAuth);
    //check if the user is found
    if (!userToUpdate) {
      return next(appErr("User not found", 403));
    }
    //if user is been blocked
    if (userToUpdate.isBlocked) {
      return next(appErr("Action not allowed, Your account is blocked", 403));
    }
    //check if a user is updating their profile photo
    if (req.file) {
      //update profile photo
      await User.findByIdAndUpdate(
        req.userAuth,
        {
          $set: {
            profilePhoto: req.file.path,
          },
        },
        {
          new: true,
        }
      );
      res.json({
        status: "success",
        data: "You have successfully updated your profile photo",
      });
    }
  } catch (error) {
    next(appErr(error.message, 500));
  }
};

module.exports = {
  userRegisterCtrl,
  userLoginCtrl,
  usersCtrl,
  userProfileCtrl,
  deleteUserCtrl,
  updateUserCtrl,
  profilePhotoUploadCtrl,
  whoViewedMyProfileCtrl,
  followingCtrl,
  unFollowCtrl,
};
