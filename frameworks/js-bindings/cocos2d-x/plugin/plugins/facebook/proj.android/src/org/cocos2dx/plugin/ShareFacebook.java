/****************************************************************************
 Copyright (c) 2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
 
package org.cocos2dx.plugin;

import java.io.File;
import java.util.Arrays;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.Set;

import org.cocos2dx.plugin.InterfaceShare;
import org.json.JSONException;
import org.json.JSONObject;

import com.facebook.FacebookException;
import com.facebook.model.GraphObject;
import com.facebook.model.OpenGraphAction;
import com.facebook.model.OpenGraphObject;
import com.facebook.widget.FacebookDialog;
import com.facebook.widget.FacebookDialog.PendingCall;
import com.facebook.widget.WebDialog;
import com.facebook.widget.FacebookDialog.MessageDialogFeature;
import com.facebook.widget.FacebookDialog.OpenGraphActionDialogFeature;
import com.facebook.widget.FacebookDialog.OpenGraphMessageDialogFeature;
import com.facebook.widget.FacebookDialog.ShareDialogFeature;
import com.facebook.widget.WebDialog.OnCompleteListener;

import android.app.Activity;
import android.content.Context;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.os.Bundle;
import android.util.Log;

public class ShareFacebook implements InterfaceShare{

	private static Activity mContext = null;
	private static InterfaceShare mAdapter = null;
	private static boolean bDebug = true;
	private final static String LOG_TAG = "ShareFacebook";
	
	protected static void LogE(String msg, Exception e) {
        Log.e(LOG_TAG, msg, e);
        e.printStackTrace();
    }

    protected static void LogD(String msg) {
        if (bDebug) {
            Log.d(LOG_TAG, msg);
        }
    }
    
    public ShareFacebook(Context context) {
		mContext = (Activity)context;		
		mAdapter = this;
		FacebookWrapper.setDialogCallback(new FacebookDialogCallback());
	}
    
	@Override
	public void configDeveloperInfo(Hashtable<String, String> cpInfo) {
		LogD("not supported in Facebook pluign");
	}

	@Override
	public void share(final Hashtable<String, String> cpInfo) {
		LogD("share invoked " + cpInfo.toString());
		if (networkReachable()) {
			PluginWrapper.runOnMainThread(new Runnable() {
				@Override
				public void run() {
					String caption = cpInfo.get("title");
					String url = cpInfo.get("link");
					String text = cpInfo.get("description");
					String picture = cpInfo.get("imageUrl");
					FacebookDialog shareDialog = new FacebookDialog.ShareDialogBuilder(mContext)
						.setCaption(caption)
						.setPicture(picture)
						.setLink(url)
						.setDescription(text)
				        .build();
					
					FacebookWrapper.track(shareDialog.present());
				}
			});
		}		
	}

	@Override
	public void setDebugMode(boolean debug) {
		bDebug = debug;		
	}

	@Override
	public String getSDKVersion() {
		return "3.14.1";
	}

	@Override
	public String getPluginVersion() {
		return "0.2.0";
	}

	private boolean networkReachable() {
		boolean bRet = false;
		try {
			ConnectivityManager conn = (ConnectivityManager)mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
			NetworkInfo netInfo = conn.getActiveNetworkInfo();
			bRet = (null == netInfo) ? false : netInfo.isAvailable();
		} catch (Exception e) {
			LogE("Fail to check network status", e);
		}
		LogD("NetWork reachable : " + bRet);
		return bRet;
	}
	

	public void dialog(final JSONObject cpInfo){
		PluginWrapper.runOnMainThread(new Runnable(){

			@Override
			public void run() {
				try {
					String dialogType = cpInfo.getString("dialog");
					if("share_link".equals(dialogType)){
						if(FacebookDialog.canPresentShareDialog(mContext, ShareDialogFeature.SHARE_DIALOG)){
							FBShareDialog(cpInfo);
						}else{
							WebFeedDialog(cpInfo);
						}
					}
					else if("share_open_graph".equals(dialogType)){
						if(FacebookDialog.canPresentOpenGraphActionDialog(mContext, OpenGraphActionDialogFeature.OG_ACTION_DIALOG)){
							FBShareOpenGraphDialog(cpInfo);
						}else{
							LogD("need Facebook app");
						}
					}
					else if("share_photo".equals(dialogType)){
						if(FacebookDialog.canPresentShareDialog(mContext, ShareDialogFeature.PHOTOS)){
							FBSharePhotoDialog(cpInfo);
						}else{
							LogD("need Facebook app to share photo");
						}
					}
					else if("apprequests".equals(dialogType)){
						WebRequestDialog(cpInfo);
					}
					else if("message_link".equals(dialogType)){
						if(FacebookDialog.canPresentMessageDialog(mContext, MessageDialogFeature.MESSAGE_DIALOG)){
							FBMessageDialog(cpInfo);
						}
					}
					else if("message_open_graph".equals(dialogType)){
						if(FacebookDialog.canPresentOpenGraphMessageDialog(mContext, OpenGraphMessageDialogFeature.OG_MESSAGE_DIALOG)){
							FBMessageOpenGraphDialog(cpInfo);
						}
					}
					else if("message_photo".equals(dialogType)){
						if(FacebookDialog.canPresentMessageDialog(mContext, MessageDialogFeature.PHOTOS)){
							FBMessagePhotoDialog(cpInfo);
						}
					}
				} catch (JSONException e) {
					e.printStackTrace();
				}
			}
			
		});
	}
	
	private void FBShareDialog(JSONObject info) throws JSONException{
		String caption = info.has("title")?info.getString("title"):info.getString("caption");
		String link = info.has("siteUrl")?info.getString("siteUrl"):info.getString("link");
		String description = info.has("text")?info.getString("text"):info.getString("description");
		String picture = info.has("imageUrl")?info.getString("imageUrl"):info.getString("picture");
		///String name = info.getString("site");
		FacebookDialog dialog = new FacebookDialog.ShareDialogBuilder(mContext)
										.setCaption(caption)
										.setLink(link)
										//.setName(name)
										.setDescription(description)
										.setPicture(picture)
										.build();
		FacebookWrapper.track(dialog.present());
	}
	
	private void FBShareOpenGraphDialog(JSONObject info) throws JSONException{
		String type = info.has("action_type")?info.getString("action_type"):info.getString("actionType");
		String previewProperty = info.has("preview_property")?info.getString("preview_property"):info.getString("previewPropertyName");
	
		OpenGraphObject obj = OpenGraphObject.Factory.createForPost(OpenGraphObject.class, type, info.getString("title"),
                        info.getString("image"), info.getString("url"),
                        info.getString("description"));
        OpenGraphAction action = GraphObject.Factory.create(OpenGraphAction.class);
        action.setProperty(previewProperty, obj);
        //action.setType(type);
        FacebookDialog shareDialog = new FacebookDialog.OpenGraphActionDialogBuilder(mContext, action, type, previewProperty)
        									.build();
    	FacebookWrapper.track(shareDialog.present());
	}
	
	private void FBSharePhotoDialog(JSONObject info) throws JSONException{
		String filepath = info.getString("photo");
		if("".equals(filepath)){
			LogD("Must specify one photo");
			return;
		}
		
		File file = new File(filepath);
		//Bitmap image = BitmapFactory.decodeFile(cpInfo.getString("photos"));
		FacebookDialog dialog = new FacebookDialog.PhotoShareDialogBuilder(mContext)
									.addPhotoFiles(Arrays.asList(file))	
									//.addPhotos(Arrays.asList(image))
									.build();
		FacebookWrapper.track(dialog.present());
	}
	
	private void WebRequestDialog(JSONObject info) throws JSONException{
		WebDialog dialog = new WebDialog.RequestsDialogBuilder(mContext)
									.setMessage(info.getString("message"))
									.setTitle(info.has("title")?info.getString("title"):"")
									//.setTo(info.getString("to"))
									.setOnCompleteListener(new OnCompleteListener(){
	
										@Override
										public void onComplete(Bundle arg0,	FacebookException arg1) {
											if(null != arg1){
												StringBuffer buffer = new StringBuffer();
												buffer.append("{\"error_message\":\"")
													.append(arg1.getMessage())
													.append("\"}");
												
												ShareWrapper.onShareResult(mAdapter, ShareWrapper.SHARERESULT_FAIL, buffer.toString());
											}else{
												StringBuffer buffer = new StringBuffer();
												buffer.append("{\"request\":\"");
												buffer.append(arg0.getString("request"));
												buffer.append("\", \"to\":[");
												
												Set<String> keys = arg0.keySet();
												Iterator<String> it = keys.iterator();
												while(it.hasNext()){
													String key = it.next();
													if(!"request".equals(key)){
														
														buffer.append("\"");
														buffer.append(arg0.getString(it.next()));
														buffer.append("\",");
													}
												}
												//remove the last ,
												buffer.deleteCharAt(buffer.length() - 1);
												buffer.append("]}");
												
												ShareWrapper.onShareResult(mAdapter, ShareWrapper.SHARERESULT_SUCCESS, buffer.toString());
											}
										}
									})
									.build();
		dialog.show();
	}
	
	private void WebFeedDialog(JSONObject info) throws JSONException{
		String caption = info.has("title")?info.getString("title"):info.getString("caption");
		String link = info.has("siteUrl")?info.getString("siteUrl"):info.getString("link");
		String description = info.has("text")?info.getString("text"):info.getString("description");
		String picture = info.has("imageUrl")?info.getString("imageUrl"):info.getString("picture");
		
		WebDialog dialog = new WebDialog.FeedDialogBuilder(mContext)
								.setCaption(caption)
								.setLink(link)
								.setDescription(description)
								.setPicture(picture)
								//.setTo(info.getString("to"))
								.setOnCompleteListener(new OnCompleteListener(){

									@Override
									public void onComplete(Bundle arg0,
											FacebookException arg1) {
										ShareWrapper.onShareResult(mAdapter, ShareWrapper.SHARERESULT_SUCCESS, "share success");
										
									}})
								.build();
		dialog.show();
	}
	
	private void FBMessageDialog(JSONObject info) throws JSONException{
		String caption = info.has("title")?info.getString("title"):info.getString("caption");
		String link = info.has("siteUrl")?info.getString("siteUrl"):info.getString("link");
		String description = info.has("text")?info.getString("text"):info.getString("description");
		String picture = info.has("imageUrl")?info.getString("imageUrl"):info.getString("picture");
		
		//String name = info.getString("site");
		
		FacebookDialog dialog = new FacebookDialog.MessageDialogBuilder(mContext)
				.setCaption(caption)
				.setLink(link)
				//.setName(name)
				.setDescription(description)
				.setPicture(picture)
		    	.build();
		FacebookWrapper.track(dialog.present());
	}
	
	

	private void FBMessageOpenGraphDialog(JSONObject info) throws JSONException{
		String type = info.has("action_type")?info.getString("action_type"):info.getString("actionType");
		String previewProperty = info.has("preview_property")?info.getString("preview_property"):info.getString("previewPropertyName");
	
		OpenGraphObject obj = OpenGraphObject.Factory.createForPost(OpenGraphObject.class, type, info.getString("title"),
                        info.getString("image"), info.getString("url"),
                        info.getString("description"));
        OpenGraphAction action = GraphObject.Factory.create(OpenGraphAction.class);
        action.setType(type);
        action.setProperty(previewProperty, obj);
        
		FacebookDialog dialog = new FacebookDialog.OpenGraphMessageDialogBuilder(mContext, action, previewProperty)
				.build();
		FacebookWrapper.track(dialog.present());
	}
	
	private void FBMessagePhotoDialog(JSONObject info) throws JSONException{
		String filepath = info.getString("photo");
		if("".equals(filepath)){
			LogD("Must specify one photo");
			return;
		}
		
		File file = new File(filepath);
		
		FacebookDialog dialog = new FacebookDialog.PhotoMessageDialogBuilder(mContext)
									.addPhotoFiles(Arrays.asList(file))
									.build();
		FacebookWrapper.track(dialog.present());
	}
	
	private class FacebookDialogCallback implements FacebookDialog.Callback{

		@Override
		public void onComplete(PendingCall arg0, Bundle arg1) {
			ShareWrapper.onShareResult(mAdapter, ShareWrapper.SHARERESULT_SUCCESS, "{\"didComplete\":true}");			
		}

		@Override
		public void onError(PendingCall arg0, Exception arg1, Bundle arg2) {
			ShareWrapper.onShareResult(mAdapter, ShareWrapper.SHARERESULT_FAIL, "{ \"error_message\" : \"" + arg1.getMessage() + "\"}");			
		}
		
	}
}
