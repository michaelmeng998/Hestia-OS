# hestiaMobile

- [Basic Environment Setup](#id-section1)
- [DB Environment Setup](#id-section2)
- [Branching Strategies](#id-section3)
- [Build Strategies](#id-section4)


<div id='id-section1'/>

## Basic Environment Setup

### Install React-Native
https://facebook.github.io/react-native/docs/getting-started

### Download and setup the latest version of Android Studio
https://developer.android.com/studio/?gclid=Cj0KCQjw-b7qBRDPARIsADVbUbUSEY1lGWehpciwuDuC4phQdOmk-LMHp566PwIM68Hu3WHCi5pnP-4aApCuEALw_wcB

Running:
- After cloning the repo, ensure you have all the dependencies installed by running:
`npm install`
- Make sure you have a metro bundler running. You can explicitly start one by running: `react-native start`

### Download and setup the latest version of Xcode

Clone the repo

1) go into project directory, npm install
2) go into ios folder, and run pod_install, if error run pod_update and then pod_install
3) open up the project in xcode, if build fails due to missing module, open up workspace in xcode and rebuild, it should work
4) if still getting errors - pray google can help you

<div id='id-section2'/>

## DB Environment Setup

### Production and Test environments

Refer to this link for more detail on setting up these environments: https://medium.com/@gregoire.frileux/how-to-manage-multiple-environments-dev-staging-prod-for-firebase-with-react-native-app-205c7c1a5e35

If there are any questions please reach out to michaelmeng998, or other collaboraters on the project
 
#### For Android Studio
  
There is a debug and release version of the firebase DB in the android folder. When building in android studio, you need to choose the `debug` build type to point the application to the test database, and choose the `release` build type for pointing the application to the production database. 

Note: when you change your build variants, make sure to gradle sync before running the application

#### For Xcode

There is a Debug and Release version of the firebase DB in the ios folder. When building in Xcode, you need to choose the `debug` build type to point the application to the test database, and choose the `release` build type for pointing the application to the production database. 

If your are building the app on these build types for the first time, then there are some setup steps you need to do for your Xcode environment.

1) Move the Resource folder into your Xcode folder,  only keep the `Create groups` option ticked when Xcode prompts you after copying the folder (make sure you only have one Resource folder in your Xcode project)

2) Create a new 'script phase' in the build phases of the project. Copy over the following script:

 ```bash
 # Name of the resource we're selectively copying
 GOOGLESERVICE_INFO_PLIST=GoogleService-Info.plist
 # Get references to dev and prod versions of the GoogleService-Info.plist
 # NOTE: These should only live on the file system and should NOT be part of the target (since we'll be adding them to the target manually)
 GOOGLESERVICE_INFO_DEV=${PROJECT_DIR}/Resources/Debug/${GOOGLESERVICE_INFO_PLIST}
 GOOGLESERVICE_INFO_PROD=${PROJECT_DIR}/Resources/Release/${GOOGLESERVICE_INFO_PLIST}
 # Make sure the dev version of GoogleService-Info.plist exists
 echo "Looking for ${GOOGLESERVICE_INFO_PLIST} in ${GOOGLESERVICE_INFO_DEV}"
 if [ ! -f $GOOGLESERVICE_INFO_DEV ]
 then
 echo "No Development GoogleService-Info.plist found. Please ensure it's in the proper directory."
 exit 1
 fi
 # Make sure the prod version of GoogleService-Info.plist exists
 echo "Looking for ${GOOGLESERVICE_INFO_PLIST} in ${GOOGLESERVICE_INFO_PROD}"
 if [ ! -f $GOOGLESERVICE_INFO_PROD ]
 then
 echo "No Production GoogleService-Info.plist found. Please ensure it's in the proper directory."
 exit 1
 fi
 # Get a reference to the destination location for the GoogleService-Info.plist
 PLIST_DESTINATION=${BUILT_PRODUCTS_DIR}/${PRODUCT_NAME}.app
 echo "Will copy ${GOOGLESERVICE_INFO_PLIST} to final destination: ${PLIST_DESTINATION}"
 # Copy over the prod GoogleService-Info.plist for Release builds
 if [ "${CONFIGURATION}" == "Release" ]
 then
 echo "Using ${GOOGLESERVICE_INFO_PROD}"
 cp "${GOOGLESERVICE_INFO_PROD}" "${PLIST_DESTINATION}"
 else
 echo "Using ${GOOGLESERVICE_INFO_DEV}"
 cp "${GOOGLESERVICE_INFO_DEV}" "${PLIST_DESTINATION}"
 fi
 ```
 
3) Move this build phase after 'Link Binary With Libraries'.

4) Then go to Product -> schemes -> edit Schemes... to change your build type. Test that both the debug and release builds point to the right database. The following test should be run.

```
In the test database, there should be an account with email: test-merchant@gmail.com, with password: password
This is a single test account that should only exist on the test database and not the production database.
```

<div id='id-section3'/>

## Branching Strategies

**master** -> Master branch will contain production level code only.
```diff
- Important: No feature development should be done on the master branch, unless they are simple hotfixes
```

**development** -> development branch will be a branch developers can push new code and changes to. Make sure changelog is updated when merging new features (that are thoroughly tested) into development.

**feature branches** -> cut feature branches off of **development** when developing new features
 
<div id='id-section4'/>

## Build Strategies

**master** -> on master, only build using the release branches. To test that you are on the release branch, please verify that you cannot log into the test-merchant@gmail.com account.

```diff
- Important: ONLY use the release build type on the master branch
```

**development and feature branches** -> on any other branches, use the debug build types only. Do not build using the release type. Future improvements will be made to restrict development and feature branches from being able to use release builds.


